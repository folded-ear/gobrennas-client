import { ActionType } from "@/data/dispatcher";
import preferencesStore from "@/data/preferencesStore";
import PlanApi from "@/features/Planner/data/PlanApi";
import PlanItemStatus, {
    willStatusDelete,
} from "@/features/Planner/data/PlanItemStatus";
import { isExpanded, isParent } from "@/features/Planner/data/plannerUtils";
import {
    BasePlanItem,
    Plan,
    PlanBucket,
    PlanItem,
    State,
    StateWithActiveTask,
} from "@/features/Planner/data/planStore";
import { BfsId } from "@/global/types/identity";
import ClientId from "@/util/ClientId";
import { bucketComparator, Named } from "@/util/comparators";
import inTheFuture from "@/util/inTheFuture";
import LoadObject from "@/util/LoadObject";
import LoadObjectState from "@/util/LoadObjectState";
import { formatLocalDate, parseLocalDate } from "@/util/time";
import dotProp from "dot-prop-immutable";
import { Maybe } from "graphql/jsutils/Maybe";
import invariant from "invariant";

const AT_END = ("AT_END_" + ClientId.next()) as BfsId;

const statusUpdatesToFlush = new Map<BfsId, StatusChange>();
let tasksToRename = new Set<BfsId>();

export interface StatusChange {
    status: PlanItemStatus;
    doneAt?: Maybe<Date>;
}

export interface TreeMutationSpec {
    ids: BfsId[];
    parentId: BfsId;
    afterId: Maybe<BfsId>;
}

export interface MoveSubtreeAction {
    id: BfsId;
    parentId: BfsId;
    before?: Maybe<BfsId>;
    after?: Maybe<BfsId>;
}

function _newTask(name: string) {
    return {
        id: ClientId.next(),
        name,
        status: PlanItemStatus.NEEDED,
    };
}

export function createList(
    state: State,
    name: string,
    optionalPlanIdToCopy?: BfsId,
): State {
    const task = _newTask(name);
    PlanApi.createPlan(name, task.id, optionalPlanIdToCopy);
    return {
        ...mapTaskLO(state, task.id, () =>
            LoadObject.withValue(task).creating(),
        ),
        topLevelIds: state.topLevelIds.map((ids) => ids.concat(task.id)),
    };
}

function idFixerFactory(cid: string, id: BfsId) {
    type Ids =
        | Maybe<BfsId>
        | BfsId[]
        | LoadObject<BfsId[]>
        | LoadObjectState<BfsId[]>;

    // IntelliJ is quite silly about the union type, so ignore its inspections.
    function idFixer<T extends Ids>(ids: T): T {
        if (ids == null) return ids;
        // This cast is safe; Typescript correctly identifies that a string
        // could become a number, but that's within BfsId, so it's ok.
        if (ids == cid && (ids === cid || ids === cid)) return id as T;
        // noinspection SuspiciousTypeOfGuard
        if (ids instanceof Array) {
            // This cast is safe; Typescript can't identify that if 'ids' is an
            // array, T must be BfsId[].
            return ids.map((v) => (v === cid ? id : v)) as T;
        }
        // noinspection SuspiciousTypeOfGuard
        if (ids instanceof LoadObject<BfsId[]>) {
            // This cast is safe; Typescript can't identify that if 'ids' is a
            // LoadObject<BfsId[]>, T must be as well.
            return ids.map(idFixer) as T;
        }
        // noinspection SuspiciousTypeOfGuard
        if (ids instanceof LoadObjectState<BfsId[]>) {
            // This cast is safe; Typescript can't identify that if 'ids' is a
            // LoadObjectState<BfsId[]>, T must be as well.
            return ids.map(idFixer) as T;
        }
        // noinspection SuspiciousTypeOfGuard
        if (typeof ids === "string") return ids;
        // noinspection SuspiciousTypeOfGuard
        if (typeof ids === "number") return ids;
        throw new Error(
            `Unsupported value passed to idFixer(${cid},${id}): ${ids}`,
        );
    }

    return idFixer;
}

function fixIds(
    state: State,
    task: Plan | PlanItem,
    id: BfsId,
    clientId: string,
): State;
function fixIds(
    state: State,
    task: Plan | PlanItem,
    id: BfsId,
    clientId: string,
): State {
    const idFixer = idFixerFactory(clientId, id);
    const byId = {
        ...state.byId,
        [id]: state.byId[clientId].map((t) => ({
            ...t,
            id,
        })),
    };
    delete byId[clientId];
    if (tasksToRename.has(clientId)) {
        tasksToRename.add(id);
        tasksToRename.delete(clientId);
    }
    const pid = parentId(task);
    if (pid != null) {
        const plo = loForId(state, pid);
        byId[pid] = plo.map((p) => ({
            ...p,
            subtaskIds: idFixer(p.subtaskIds),
        }));
    }
    if (isParent(task)) {
        // isParent ensures subtaskIds is non-empty, so the assertion is safe
        task.subtaskIds!.forEach((sid) => {
            byId[sid] = byId[sid].map((s) => ({
                ...s,
                parentId: id,
            }));
        });
    }
    return flushTasksToRename({
        ...state,
        activeTaskId: idFixer(state.activeTaskId),
        byId,
    });
}

export function tasksCreated(
    state: State,
    tasks: Array<Plan | PlanItem>,
    newIds: Record<BfsId, string>,
): State {
    if (newIds != null) {
        for (const [id, cid] of Object.entries(newIds)) {
            if (!isKnown(state, cid)) continue;
            state = fixIds(state, taskForId(state, cid), id, cid);
        }
    }
    return tasksLoaded(state, tasks);
}

export function listCreated(
    state: State,
    clientId: BfsId,
    id: BfsId,
    plan: Plan,
): State {
    const idFixer = idFixerFactory(clientId, id);
    const byId = {
        ...state.byId,
        [id]: LoadObject.withValue(plan),
    };
    delete byId[clientId];
    return addTask(
        {
            ...state,
            topLevelIds: idFixer(state.topLevelIds),
            byId,
        },
        id,
        "",
    );
}

export function selectList(state: State, id: Maybe<BfsId>): State {
    if (state.activeListId === id) return state;
    // flush any yet-unsaved changes
    state = flushTasksToRename(state);
    // only valid ids, please
    invariant(
        id == null ||
            state.topLevelIds.getLoadObject().getValueEnforcing().includes(id),
        `Task '${id}' is not a list.`,
    );
    state = {
        ...state,
        activeListId: id,
        listDetailVisible: false,
    };
    // clearing it, I guess?
    if (id == null) return state;
    const list = taskForId(state, id);
    if (list.subtaskIds && list.subtaskIds.length) {
        state = list.subtaskIds.reduce(taskLoading, {
            ...state,
            activeTaskId: list.subtaskIds[0],
        });
    } else {
        state = addTask(state, id, "");
    }
    PlanApi.getDescendantsAsList(state.activeListId!);
    return state;
}

export function isKnown(state: State, id: BfsId): boolean {
    return state.byId.hasOwnProperty(id);
}

export function taskForId(state: State, id: BfsId): Plan | PlanItem {
    return loForId(state, id).getValueEnforcing();
}

export function loForId(state: State, id: BfsId): LoadObject<Plan | PlanItem> {
    invariant(id != null, "No task has a null id.");
    const lo = state.byId[id] || LoadObject.empty();
    // @ts-expect-error kludge for pre-load react keys
    lo.id = id;
    return lo;
}

export function tasksForIds(
    state: State,
    ids: Maybe<BfsId[]>,
): Array<Plan | PlanItem> {
    return losForIds(state, ids).map((lo) => lo.getValueEnforcing());
}

export function losForIds(
    state: State,
    ids: Maybe<BfsId[]>,
): LoadObject<Plan | PlanItem>[] {
    return ids == null ? [] : ids.map((id) => loForId(state, id));
}

// after can be `null`, an id, or the magic `AT_END` value
function spliceIds(
    ids: Maybe<BfsId[]>,
    id: BfsId,
    after: BfsId = AT_END,
): BfsId[] {
    if (ids == null) return [id];
    if (ids.length === 0 || after === AT_END) {
        return ids.concat(id);
    }
    if (after == null) {
        return [id].concat(ids);
    }
    let idx = ids.indexOf(after);
    if (idx < 0) return ids.concat(id);
    idx += 1; // we want to be after that guy
    return ids.slice(0, idx).concat(id, ids.slice(idx));
}

export function addTask(
    state: State,
    parentId: BfsId,
    name: string,
    after: BfsId = AT_END,
): StateWithActiveTask {
    const task = _newTask(name);
    state = mapTask<Plan | PlanItem>(state, parentId, (p) => ({
        ...p,
        subtaskIds: spliceIds(p.subtaskIds, task.id, after),
    }));
    state = mapTaskLO(state, task.id, () =>
        LoadObject.withValue({
            ...task,
            parentId,
        }),
    );
    return {
        ...state,
        activeTaskId: task.id,
    };
}

export function addTaskAndFlush(
    state: State,
    parentId: BfsId,
    name: string,
    after: BfsId = AT_END,
): State {
    state = addTask(state, parentId, name, after);
    tasksToRename.add(state.activeTaskId!);
    return flushTasksToRename(state);
}

export function createTaskAfter(state: State, id: BfsId): StateWithActiveTask {
    const t = taskForId(state, id) as PlanItem;
    invariant(
        t.parentId != null,
        `Can't create a task after root-level '${id}'`,
    );
    return addTask(state, t.parentId, "", id);
}

export function createTaskBefore(state: State, id: BfsId): State {
    const t = taskForId(state, id) as PlanItem;
    invariant(
        t.parentId != null,
        `Can't create a task before root-level '${id}'`,
    );
    const p = taskForId(state, t.parentId);
    let afterId: BfsId = AT_END; // implied first
    if (p.subtaskIds != null) {
        const idx = p.subtaskIds.indexOf(id);
        if (idx > 0) {
            afterId = p.subtaskIds[idx - 1];
        }
    }
    state = addTask(state, t.parentId, "", afterId);
    return state;
}

function getSubtaskIds(state: State, parentId: BfsId): BfsId[] {
    const parent = taskForId(state, parentId);
    if (!parent.subtaskIds)
        throw new TypeError(`Presumed parent '${parentId}' has no children?!`);
    return parent.subtaskIds;
}

export function flushTasksToRename(state: State): State {
    if (tasksToRename.size === 0) return state;
    const requeue = new Set<BfsId>();
    for (const id of tasksToRename) {
        const task = taskForId(state, id) as PlanItem;
        if (!ClientId.is(id)) {
            PlanApi.renameItem(id, task.name);
            continue;
        }
        if (ClientId.is(task.parentId)) {
            requeue.add(id);
            continue;
        }
        const selfAndSiblingIds = getSubtaskIds(state, task.parentId);
        const idx = selfAndSiblingIds.indexOf(id);
        const afterId = idx === 0 ? null : selfAndSiblingIds[idx - 1];
        if (ClientId.is(afterId)) {
            requeue.add(id);
            continue;
        }
        PlanApi.createItem(id, task.parentId, afterId, task.name);
    }
    tasksToRename = requeue;
    if (requeue.size > 0) inTheFuture(ActionType.PLAN__FLUSH_RENAMES, 0.5);
    return state;
}

function mapTaskLO<T>(
    state: State,
    id: BfsId,
    work: (lo: LoadObject<T>) => LoadObject<T>,
): State {
    return dotProp.set(state, ["byId", id], (lo: unknown) => {
        // dotProp will give us an anonymous object literal on a missing key...
        return work(lo instanceof LoadObject ? lo : LoadObject.empty());
    });
}

export function mapTask<T>(state: State, id: BfsId, work: (it: T) => T): State {
    return mapTaskLO<T>(state, id, (lo) => lo.map(work));
}

export function renameTask(
    state: StateWithActiveTask,
    id: BfsId,
    name: string,
): StateWithActiveTask;
export function renameTask(state: State, id: BfsId, name: string): State;
export function renameTask(state: State, id: BfsId, name: string): State {
    return mapTaskLO<Plan | PlanItem>(state, id, (lo) => {
        if (lo.isDone()) {
            lo = ClientId.is(id) ? lo.creating() : lo.updating();
        }
        tasksToRename.add(id);
        inTheFuture(ActionType.PLAN__FLUSH_RENAMES);
        return lo.map((t) => ({
            ...t,
            name,
        }));
    });
}

export function setPlanColor(state: State, id: BfsId, color: string): State {
    return mapTaskLO<Plan>(state, id, (lo) => {
        PlanApi.setPlanColor(id, color);
        return lo
            .map((t) => ({
                ...t,
                color,
            }))
            .updating();
    });
}

export function setPlanNotes(state: State, id: BfsId, notes: string): State {
    return mapTaskLO<Plan>(state, id, (lo) => {
        PlanApi.setPlanNotes(id, notes);
        return lo
            .map((t) => ({
                ...t,
                notes,
            }))
            .updating();
    });
}

export function assignToBucket(
    state: State,
    id: BfsId,
    bucketId: Maybe<BfsId>,
): State {
    if (ClientId.is(id)) return state;
    PlanApi.assignBucket(id, bucketId);
    return mapTask<PlanItem>(state, id, (t) => ({
        ...t,
        bucketId,
    }));
}

export function focusTask(state: State, id: BfsId): State {
    taskForId(state, id);
    if (state.activeTaskId === id) return state;
    return {
        ...state,
        activeTaskId: id,
        selectedTaskIds: undefined,
    };
}

function getNeighborId(
    state: State,
    id: BfsId,
    delta = 1,
    crossGenerations = false,
    _searching = false,
): Maybe<BfsId> {
    invariant(delta === 1 || delta === -1, "Delta must be either 1 or -1");
    const t = taskForId(state, id) as PlanItem;
    if (t.parentId == null) return null;
    const siblingIds = getSubtaskIds(state, t.parentId);
    const idx = siblingIds.indexOf(id);
    invariant(
        idx >= 0,
        `Task '${t.id}' isn't a child of it's parent ('${t.parentId}')?`,
    );

    if (delta > 0) {
        // to first child
        if (crossGenerations && isExpanded(t)) return t.subtaskIds![0];
        // to next sibling
        if (idx < siblingIds.length - 1) return siblingIds[idx + 1];
        // to parent's next sibling (recurse)
        if (crossGenerations || _searching)
            return getNeighborId(state, t.parentId, delta, false, true);
        // can't move
        return null;
    } else {
        // to prev sibling's last self-or-descendant
        if (idx > 0)
            return crossGenerations
                ? lastDescendantIdOf(state, siblingIds[idx - 1])
                : siblingIds[idx - 1];
        // to parent (null or not)
        if (crossGenerations && t.parentId !== state.activeListId)
            return t.parentId;
        return null;
    }
}

function lastDescendantIdOf(state: State, id: BfsId): Maybe<BfsId> {
    while (id != null) {
        const desc = taskForId(state, id) as PlanItem;
        if (!isExpanded(desc)) return desc.id;
        id = desc.subtaskIds![desc.subtaskIds!.length - 1];
    }
    return null;
}

export function focusDelta(state: State, id: BfsId, delta: number): State {
    if (delta === 0) return state;
    const sid = getNeighborId(state, id, delta, true);
    if (sid == null) return state;
    return focusTask(state, sid);
}

export function selectTo(state: State, id: BfsId): State {
    if (state.activeTaskId == null) return focusTask(state, id);
    if (id === state.activeTaskId) return state;
    const target = taskForId(state, id) as PlanItem;
    const siblingIds = getSubtaskIds(state, target.parentId);
    let i = siblingIds.indexOf(state.activeTaskId);
    let j = siblingIds.indexOf(id);
    if (i > j) {
        j += 1; // active doesn't get selected
        i += 1; // inclusive upper bound
        const temp = i;
        i = j;
        j = temp;
    }
    return {
        ...state,
        activeTaskId: id,
        selectedTaskIds: siblingIds.slice(i, j),
    };
}

export function selectDelta(state: State, id: BfsId, delta: number): State {
    const next = getNeighborId(state, id, delta, false);
    if (next == null) return state; // there's no neighbor
    if (state.selectedTaskIds == null) {
        // starting to select
        return {
            ...focusTask(state, next),
            selectedTaskIds: [id],
        };
    }
    const idx = state.selectedTaskIds.indexOf(next);
    if (idx >= 0) {
        // contract selection
        return {
            ...focusTask(state, next),
            selectedTaskIds:
                state.selectedTaskIds.length === 0
                    ? null
                    : state.selectedTaskIds.slice(0, idx),
        };
    } else {
        // expand selection
        return {
            ...focusTask(state, next),
            selectedTaskIds: state.selectedTaskIds.concat(id),
        };
    }
}

function unqueueTaskId(id: BfsId): void {
    tasksToRename.delete(id);
    statusUpdatesToFlush.delete(id);
}

function doTaskDelete(state: State, id: BfsId): State {
    unqueueTaskId(id);
    PlanApi.deleteItem(id);
    return state;
}

export function flushStatusUpdates(state: State): State {
    if (statusUpdatesToFlush.size === 0) return state;
    // I cannot figure out how to get the first entry of a Map in a type-safe
    // way w/out a non-looping "loop" like this.
    // noinspection LoopStatementThatDoesntLoopJS
    for (const [id, change] of statusUpdatesToFlush.entries()) {
        if (willStatusDelete(change.status)) {
            unqueueTaskId(id);
        }
        PlanApi.updateItemStatus(id, change);
        statusUpdatesToFlush.delete(id);
        break;
    }
    if (statusUpdatesToFlush.size > 0) {
        inTheFuture(ActionType.PLAN__FLUSH_STATUS_UPDATES, 0.5);
    }
    return state;
}

export function queueDelete(state: State, id: BfsId): State {
    if (!isKnown(state, id)) return state; // already gone...
    return queueStatusUpdate(state, id, {
        status: PlanItemStatus.DELETED,
    });
}

function isEmpty(taskOrString: Named | string): boolean {
    if (taskOrString == null) return true;
    const str =
        typeof taskOrString === "string" ? taskOrString : taskOrString.name;
    return str == null || str.trim() === "";
}

function queueStatusUpdate(
    state: State,
    id: BfsId,
    change: StatusChange,
): State {
    const { status } = change;
    const lo = loForId(state, id) as LoadObject<PlanItem>;
    const t = lo.getValueEnforcing();
    invariant(t.parentId != null, "Can't change plan '%s' to %s", id, status);
    if (t._next_status === status) return state; // we're golden
    const isDelete = willStatusDelete(status);
    if (isDelete && ClientId.is(id)) {
        // short circuit this one...
        return taskDeleted(state, id);
    }
    if (isDelete && isEmpty(t)) {
        state = doTaskDelete(state, id);
        return taskDeleted(state, id);
    }
    let nextLO;
    if (t.status === status) {
        statusUpdatesToFlush.delete(t.id);
        nextLO = lo
            .map((t) => {
                t = {
                    ...t,
                };
                delete t._next_status;
                return t;
            })
            .done();
    } else {
        statusUpdatesToFlush.set(id, change);
        inTheFuture(ActionType.PLAN__FLUSH_STATUS_UPDATES, 4);
        nextLO = lo.map((t) => ({
            ...t,
            _next_status: status,
            _expanded: t._expanded && !isDelete,
        }));
        if (isDelete) {
            nextLO = nextLO.deleting();
        } else {
            nextLO = nextLO.updating();
        }
    }
    state = {
        ...state,
        byId: {
            ...state.byId,
            [id]: nextLO,
        },
    };
    if (state.activeListId === id) {
        state.activeTaskId = undefined;
    }
    if (state.selectedTaskIds) {
        state.selectedTaskIds = state.selectedTaskIds.filter((it) => it !== id);
    }
    return state;
}

export function cancelStatusUpdate(state: State, id: BfsId): State {
    if (!statusUpdatesToFlush.has(id)) return state;
    statusUpdatesToFlush.delete(id);
    return mapTaskLO<PlanItem>(state, id, (lo) =>
        lo
            .map((t) => {
                t = { ...t };
                delete t._next_status;
                return t;
            })
            .done(),
    );
}

export function taskDeleted(state: State, id: BfsId): State {
    unqueueTaskId(id);
    if (!isKnown(state, id)) return state;
    const t = taskForId(state, id) as PlanItem;
    let p = taskForId(state, t.parentId);
    const siblingIds = p.subtaskIds!;
    const idx = siblingIds.indexOf(id);
    p = {
        ...p,
        subtaskIds: siblingIds.slice(0, idx).concat(siblingIds.slice(idx + 1)),
    };
    const byId = { ...state.byId };
    byId[p.id] = byId[p.id].setValue(p);
    const kill = (id: BfsId) => {
        const lo = byId[id];
        if (lo == null) return;
        if (lo.hasValue()) {
            const ids = lo.getValueEnforcing().subtaskIds;
            if (ids) ids.forEach(kill);
        }
        delete byId[id];
    };
    kill(id);
    state = {
        ...state,
        byId,
    };
    if (state.activeTaskId == null || !isKnown(state, state.activeTaskId)) {
        state = {
            ...state,
            activeTaskId: undefined,
        };
    }
    if (p.id === state.activeListId && !isParent(p)) {
        // it was the last task on the list
        state = addTask(state, p.id, "", AT_END);
    }
    return state;
}

/**
 * I return an array of [task, parent, index] tuples for the active task(s).
 */
export function getOrderedBlock(
    state: State,
): Array<[PlanItem, BasePlanItem, number]> {
    const block = [state.activeTaskId!];
    if (state.selectedTaskIds != null) {
        block.push(...state.selectedTaskIds);
    }
    return block
        .map((id) => taskForId(state, id) as PlanItem)
        .map(
            (t) =>
                [t, taskForId(state, t.parentId)] as [PlanItem, BasePlanItem],
        )
        .map(([t, p]): [PlanItem, BasePlanItem, number] => [
            t,
            p,
            p.subtaskIds!.indexOf(t.id),
        ])
        .sort((a, b) => a[2] - b[2]);
}

export function moveDelta(state: State, delta: number): State {
    const upward = delta < 1;
    const block = getOrderedBlock(state);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ignored, p, idx] = block[upward ? 0 : block.length - 1];
    if (upward && idx === 0) return state;
    const siblingIds = p.subtaskIds!;
    if (!upward && idx === siblingIds.length - 1) return state;
    const afterId = siblingIds[idx + delta + (upward ? -1 : 0)];
    return mutateTree(state, {
        ids: block.map(([t]) => t.id),
        parentId: p.id,
        afterId,
    });
}

function subtaskIdBefore(
    state: State,
    parentId: BfsId,
    before: BfsId | null,
): Maybe<BfsId> {
    const p = taskForId(state, parentId);
    if (!p.subtaskIds || p.subtaskIds.length === 0) return null;
    const idx = before ? p.subtaskIds.indexOf(before) : -1;
    if (idx < 0) return p.subtaskIds[p.subtaskIds.length - 1];
    if (idx === 0) return null;
    return p.subtaskIds[idx - 1];
}

export function moveSubtree(state: State, action: MoveSubtreeAction): State {
    let blockIds = getOrderedBlock(state).map(([t]) => t.id);
    const afterId = action.before
        ? subtaskIdBefore(state, action.parentId, action.before)
        : action.after;
    if (
        blockIds.includes(action.parentId) ||
        (afterId && blockIds.includes(afterId))
    ) {
        // dragging into the selection, so unselect
        state = {
            ...state,
            selectedTaskIds: undefined,
        };
        blockIds = [state.activeTaskId!];
    }
    if (!blockIds.includes(action.id)) {
        blockIds = [action.id];
    }
    return mutateTree(state, {
        ids: blockIds,
        parentId: action.parentId,
        afterId,
    });
}

function parentId(it: Plan | PlanItem) {
    return "parentId" in it ? it.parentId : undefined;
}

function mutateTree(state: State, spec: TreeMutationSpec): State {
    // ensure no client IDs
    if (spec.ids.some((id) => ClientId.is(id))) return state;
    if (ClientId.is(spec.parentId)) return state;
    if (ClientId.is(spec.afterId)) return state;
    // ensure we're not going to create a cycle
    for (
        let id: BfsId | undefined = spec.parentId;
        id;
        id = parentId(taskForId(state, id))
    ) {
        if (spec.ids.includes(id)) return state;
    }
    // ensure we're not positioning something based on itself
    if (spec.afterId && spec.ids.includes(spec.afterId)) return state;
    PlanApi.mutateTree(spec);
    // do it now so the UI updates; the future delta will be a race-y no-op
    return treeMutated(state, spec);
}

function treeMutated(state: State, spec: TreeMutationSpec): State {
    const byId = { ...state.byId };
    // put each item after the previous one
    let afterId = spec.afterId;
    for (const id of spec.ids) {
        const lo = byId[id];
        // remove the task from its old parent
        const oldPid = (lo.getValueEnforcing() as PlanItem).parentId;
        byId[oldPid] = byId[oldPid].map((t) => {
            const ids = t.subtaskIds!;
            const idx = ids.indexOf(id);
            if (idx < 0) return t;
            const subtaskIds = ids.slice();
            subtaskIds.splice(idx, 1);
            return {
                ...t,
                subtaskIds,
            };
        });
        // update the tasks' parents
        byId[id] = lo.map((t) => ({
            ...t,
            parentId: spec.parentId,
        }));
        // add the task to its new parent
        byId[spec.parentId] = byId[spec.parentId].map((t) => {
            let subtaskIds = t.subtaskIds;
            if (subtaskIds) {
                const afterIdx =
                    afterId == null ? 0 : subtaskIds.indexOf(afterId) + 1;
                const currIdx = subtaskIds.indexOf(id);
                if (currIdx < 0 || currIdx !== afterIdx + 1) {
                    subtaskIds = subtaskIds.slice();
                    if (currIdx >= 0) {
                        subtaskIds.splice(currIdx, 1);
                    }
                    subtaskIds.splice(afterIdx, 0, id);
                }
            } else {
                subtaskIds = [id];
            }
            return {
                ...t,
                subtaskIds,
            };
        });
        afterId = id;
    }
    return {
        ...state,
        byId,
    };
}

export function nestTask(state: State): State {
    const block = getOrderedBlock(state);
    if (block.some(([t, p]) => p.subtaskIds!.indexOf(t.id) === 0)) {
        // nothing to nest under
        return state;
    }
    const [t, p] = block[0];
    const subtaskIds = p.subtaskIds!;
    const idx = subtaskIds.indexOf(t.id);
    const np = taskForId(state, subtaskIds[idx - 1]);
    state = mutateTree(state, {
        ids: block.map(([t]) => t.id),
        parentId: np.id,
        afterId:
            np.subtaskIds && np.subtaskIds.length
                ? np.subtaskIds[np.subtaskIds.length - 1]
                : null,
    });
    return setExpansion(state, np.id, true);
}

// if expanded is nullish, it means "toggle it"
function setExpansion(state: State, id: BfsId, expanded?: boolean): State {
    return dotProp.set(state, ["byId", id], (lo: LoadObject<PlanItem>) =>
        lo.map((t) => ({
            ...t,
            _expanded: expanded == null ? !t._expanded : expanded,
        })),
    );
}

export function unnestTask(state: State): State {
    const block = getOrderedBlock(state);
    if (block.some(([t]) => t.parentId === state.activeListId)) {
        // nothing to unnest from
        return state;
    }
    const p = block[block.length - 1][1] as PlanItem;
    return mutateTree(state, {
        ids: block.map(([t]) => t.id),
        parentId: p.parentId,
        afterId: p.id,
    });
}

export function toggleExpanded(state: State, id: BfsId): State {
    // if toggling a non-parent, that means "collapse my parent"
    const t = taskForId(state, id) as PlanItem;
    if (!isParent(t)) {
        if (t.parentId === state.activeListId) {
            // we don't do the plan
            return state;
        }
        id = t.parentId;
        state = focusTask(state, id);
    }
    return setExpansion(state, id);
}

function forceExpansionBuilder(expanded: boolean): (state: State) => State {
    const work = (state: State, id: BfsId): State => {
        const lo = loForId(state, id);
        if (!lo.hasValue()) return state;
        const t = lo.getValueEnforcing();
        if (!isParent(t)) return state;
        state = setExpansion(state, t.id, expanded);
        return t.subtaskIds!.reduce(work, state);
    };
    return (state: State): State => {
        if (state.activeListId == null) return state;
        return work(state, state.activeListId);
    };
}

export const expandAll = forceExpansionBuilder(true);
export const collapseAll = forceExpansionBuilder(false);

export function taskLoaded(state: State, task: Plan | PlanItem): State {
    if ("acl" in task) {
        task = {
            ...task,
            buckets: task.buckets ? task.buckets.sort(bucketComparator) : [],
        };
    }
    let lo = state.byId[task.id] || LoadObject.empty();
    if (lo.hasValue()) {
        lo = lo.map((t) => {
            const subtaskIds = task.subtaskIds ? task.subtaskIds.slice() : [];
            t.subtaskIds &&
                t.subtaskIds.forEach((id, idx) => {
                    if (!ClientId.is(id)) return;
                    if (idx < subtaskIds.length) {
                        subtaskIds.splice(idx, 0, id);
                    } else {
                        subtaskIds.push(id);
                    }
                });
            t = {
                ...t,
                ...task,
                name: task.id === state.activeTaskId ? t.name : task.name,
                subtaskIds: subtaskIds.length ? subtaskIds : undefined,
            };
            if ("_next_status" in t && t.status === t._next_status) {
                // it worked!
                delete t._next_status;
            }
            return t;
        });
    } else {
        lo = lo.setValue(task);
    }
    return dotProp.set(state, ["byId", task.id], lo.done());
}

function taskLoading(state: State, id: BfsId): State {
    return dotProp.set(state, ["byId", id], (lo: unknown) =>
        lo instanceof LoadObject ? lo.loading() : LoadObject.loading(),
    );
}

export function loadLists(state: State): State {
    PlanApi.loadPlans();
    return {
        ...state,
        topLevelIds: state.topLevelIds.mapLO((lo) => lo.loading()),
    };
}

export function tasksLoaded(
    state: State,
    tasks: Array<Plan | PlanItem>,
): State {
    return tasks.reduce((s, t) => taskLoaded(s, t), state);
}

export function selectDefaultList(state: State): State {
    const listIds = state.topLevelIds.getLoadObject().getValueEnforcing();
    if (listIds.length > 0) {
        // see if there's a preferred active plan
        let activePlanId = preferencesStore.getActivePlan();
        if (listIds.find((id) => id === activePlanId) == null) {
            // auto-select the first one, if there is one
            activePlanId = listIds[0];
        }
        state = selectList(state, activePlanId);
    }
    return state;
}

export function listsLoaded(state: State, lists: Plan[]): State {
    state = {
        ...tasksLoaded(state, lists),
        topLevelIds: state.topLevelIds.setLoadObject(
            LoadObject.withValue(lists.map((t) => t.id)),
        ),
    };
    state = selectDefaultList(state);
    return state;
}

export function mapPlanBuckets(
    state: State,
    planId: BfsId,
    work: (buckets: PlanBucket[]) => PlanBucket[],
): State {
    return dotProp.set(state, ["byId", planId], (lo: LoadObject<Plan>) =>
        lo.map((t) => ({
            ...t,
            buckets: work(t.buckets || []),
        })),
    );
}

export function saveBucket(state: State, bucket: PlanBucket) {
    ClientId.is(bucket.id)
        ? PlanApi.createBucket(state.activeListId!, bucket)
        : PlanApi.updateBucket(state.activeListId!, bucket.id, bucket);
}

export function resetToThisWeeksBuckets(state: State, planId: BfsId): State {
    return mapPlanBuckets(state, planId, (buckets) => {
        const result: PlanBucket[] = [];
        const today = parseLocalDate(formatLocalDate(new Date()))!.valueOf();
        const desiredDates = new Set<number>();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            desiredDates.add(date.valueOf());
        }
        const toDelete: BfsId[] = [];
        for (const b of buckets) {
            if (b.date) {
                const dateVal: number = b.date.valueOf();
                if (desiredDates.has(dateVal)) {
                    // don't need to create one
                    desiredDates.delete(dateVal);
                } else if (dateVal < today && !ClientId.is(b.id)) {
                    // in the past, so delete it
                    toDelete.push(b.id);
                    continue;
                }
            }
            result.push(b);
        }
        const toCreate: PlanBucket[] = [];
        for (const d of desiredDates) {
            toCreate.push({
                id: ClientId.next(),
                date: new Date(d),
            });
        }
        if (toDelete.length > 0 || toCreate.length > 0) {
            PlanApi.spliceBuckets(planId, toDelete, toCreate);
            result.push(...toCreate);
        }
        return result.sort(bucketComparator);
    });
}

export function sortActivePlanByBucket(state: State): State {
    const plan = taskForId(state, state.activeListId!) as Plan;
    if (!plan.buckets || !plan.subtaskIds) return state;
    // Sort mutates directly, but it should be a no-op (i.e., the buckets are
    // already correctly ordered). If it's not, it should result in some items
    // moving around, but may not update bucket listings themselves, because
    // React won't notice the change.
    plan.buckets.sort(bucketComparator);
    const bucketIdOrder = plan.buckets.reduce(
        (index, b, i) => {
            index[b.id] = i;
            return index;
        },
        {} as Record<BfsId, number>,
    );
    type IdOrder = [BfsId, number]; // IntelliJ/Prettier race if inlined...
    const desiredIds = plan.subtaskIds
        .map((id) => taskForId(state, id))
        .map(
            (t) =>
                [t.id, t.bucketId ? bucketIdOrder[t.bucketId] : -1] as IdOrder,
        )
        .sort((pa, pb) => pa[1] - pb[1])
        .map((pair) => pair[0]);
    for (let i = 0, l = desiredIds.length; i < l; i++) {
        if (plan.subtaskIds[i] !== desiredIds[i]) {
            PlanApi.reorderSubitems(plan.id, desiredIds);
            // update immediately; the coming delta will be a no-op
            return mapTask<Plan>(state, plan.id, (v) => ({
                ...v,
                subtaskIds: desiredIds,
            }));
        }
    }
    return state; // no-op
}

export function doInteractiveStatusChange(
    state: State,
    id: BfsId,
    change: PlanItemStatus | StatusChange,
): State {
    if (typeof change === "string") {
        change = { status: change };
    }
    if (willStatusDelete(change.status) && id === state.activeTaskId) {
        state = focusDelta(state, id, 1);
    }
    return queueStatusUpdate(state, id, change);
}
