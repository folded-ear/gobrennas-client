import ClientId from "@/util/ClientId";
import PlanItemStatus, {
    willStatusDelete,
} from "@/features/Planner/data/PlanItemStatus";
import TaskApi from "@/features/Planner/data/TaskApi";
import LoadObject from "@/util/LoadObject";
import LoadObjectState from "@/util/LoadObjectState";
import { isExpanded, isParent } from "@/features/Planner/data/plannerUtils";
import invariant from "invariant/invariant";
import PlanApi from "@/features/Planner/data/PlanApi";
import inTheFuture from "@/util/inTheFuture";
import PlanActions from "@/features/Planner/data/PlanActions";
import dotProp from "dot-prop-immutable";
import { bucketComparator } from "@/util/comparators";
import preferencesStore from "@/data/preferencesStore";
import { formatLocalDate, parseLocalDate } from "@/util/time";
import { PlanBucket } from "./planStore";
import {
    BfsId,
    bfsIdEq,
    BfsStringId,
    ensureString,
    includesBfsId,
    indexOfBfsId,
} from "@/global/types/identity";
import { PlanItem, State } from "@/features/Planner/data/planStore";
import { Maybe } from "graphql/jsutils/Maybe";

const AT_END = ("AT_END_" + ClientId.next()) as BfsId;

export interface StatusChange {
    status: PlanItemStatus;
    doneAt?: Maybe<Date>;
}

const _newTask = (name) => ({
    id: ClientId.next(),
    name,
    status: PlanItemStatus.Needed,
});

export const createList = (
    state: State,
    name: string,
    optionalPlanIdToCopy?: BfsId,
) => {
    const task = _newTask(name);
    TaskApi.createList(name, task.id, optionalPlanIdToCopy);
    return {
        ...mapTaskLO(state, task.id, () =>
            LoadObject.withValue(task).creating(),
        ),
        activeListId: task.id,
        activeTaskId: null,
        topLevelIds: state.topLevelIds.map((ids) => ids.concat(task.id)),
    };
};

const idFixerFactory = (cid, id) => {
    const idFixer = (ids) => {
        if (ids == null) return null;
        if (ids == cid && bfsIdEq(ids, cid)) return id;
        if (ids instanceof Array) {
            return ids.map((v) => (bfsIdEq(v, cid) ? id : v));
        }
        if (ids instanceof LoadObject) return ids.map(idFixer);
        if (ids instanceof LoadObjectState) return ids.map(idFixer);
        if (typeof ids === "string") return ids;
        if (typeof ids === "number") return ids;
        throw new Error("Unsupported value passed to replaceId: " + ids);
    };
    return idFixer;
};

const fixIds = (state: State, task, id: BfsId, clientId: string) => {
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
        tasksToRename.add(ensureString(id));
        tasksToRename.delete(clientId);
    }
    if (task.parentId != null) {
        const plo = loForId(state, task.parentId);
        byId[task.parentId] = plo.map((p) => ({
            ...p,
            subtaskIds: idFixer(p.subtaskIds),
        }));
    }
    if (isParent(task)) {
        task.subtaskIds.forEach((sid) => {
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
};

export const tasksCreated = (state: State, tasks, newIds) => {
    if (newIds != null) {
        for (const id of Object.keys(newIds)) {
            const cid = newIds[id];
            if (!isKnown(state, cid)) continue;
            state = fixIds(state, taskForId(state, cid), id, cid);
        }
    }
    return tasksLoaded(state, tasks);
};

export const listCreated = (state: State, clientId, id, list) => {
    const idFixer = idFixerFactory(clientId, id);
    const byId = {
        ...state.byId,
        [id]: LoadObject.withValue(list),
    };
    delete byId[clientId];
    state = addTask(
        {
            ...state,
            topLevelIds: idFixer(state.topLevelIds),
            byId,
        },
        id,
        "",
    );
    state = selectList(state, id);
    return state;
};

export const selectList = (state: State, id: Maybe<BfsId>): State => {
    if (bfsIdEq(state.activeListId, id)) return state;
    // flush any yet-unsaved changes
    state = flushTasksToRename(state);
    // only valid ids, please
    invariant(
        id == null ||
            includesBfsId(
                state.topLevelIds.getLoadObject().getValueEnforcing(),
                id,
            ),
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
};

export const isKnown = (state: State, id) =>
    state.byId.hasOwnProperty(ensureString(id));

export const taskForId = (state: State, id) =>
    loForId(state, id).getValueEnforcing();

export const loForId = (state: State, id: BfsId) => {
    invariant(id != null, "No task has a null id.");
    const lo = state.byId[id] || LoadObject.empty();
    // @ts-expect-error kludge for pre-load react keys
    lo.id = id;
    return lo;
};

export const tasksForIds = (state: State, ids) =>
    losForIds(state, ids).map((lo) => lo.getValueEnforcing());

export const losForIds = (state: State, ids) =>
    ids == null ? [] : ids.map((id) => loForId(state, id));

// after can be `null`, an id, or the magic `AT_END` value
const spliceIds = (ids, id, after = AT_END) => {
    if (ids == null) return [id];
    if (ids.length === 0 || after === AT_END) {
        return ids.concat(id);
    }
    if (after == null) {
        return [id].concat(ids);
    }
    let idx = indexOfBfsId(ids, after);
    if (idx < 0) return ids.concat(id);
    idx += 1; // we want to be after that guy
    return ids.slice(0, idx).concat(id, ids.slice(idx));
};

export const addTask = (state: State, parentId, name, after = AT_END) => {
    const task = _newTask(name);
    state = mapTask(state, parentId, (p) => ({
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
};

export const addTaskAndFlush = (
    state: State,
    parentId,
    name,
    after = AT_END,
) => {
    state = addTask(state, parentId, name, after);
    tasksToRename.add(ensureString(state.activeTaskId!));
    return flushTasksToRename(state);
};

export const createTaskAfter = (state: State, id) => {
    const t = taskForId(state, id);
    invariant(
        t.parentId != null,
        `Can't create a task after root-level '${id}'`,
    );
    state = addTask(state, t.parentId, "", id);
    return state;
};

export const createTaskBefore = (state: State, id) => {
    const t = taskForId(state, id);
    invariant(
        t.parentId != null,
        `Can't create a task before root-level '${id}'`,
    );
    const p = taskForId(state, t.parentId);
    let afterId: BfsId = AT_END; // implied first
    if (p.subtaskIds != null) {
        const idx = indexOfBfsId(p.subtaskIds, id);
        if (idx > 0) {
            afterId = p.subtaskIds[idx - 1];
        }
    }
    state = addTask(state, t.parentId, "", afterId);
    return state;
};

let tasksToRename = new Set<BfsStringId>();

const getSubtaskIds = (state: State, parentId: BfsId) => {
    const parent = taskForId(state, parentId);
    if (!parent.subtaskIds)
        throw new TypeError(`Presumed parent '${parentId}' has no children?!`);
    return parent.subtaskIds;
};

export const flushTasksToRename = (state: State) => {
    if (tasksToRename.size === 0) return state;
    const requeue = new Set<BfsStringId>();
    for (const id of tasksToRename) {
        const task = taskForId(state, id);
        if (!ClientId.is(id)) {
            PlanApi.renameItem(id, task.name);
            continue;
        }
        if (ClientId.is(task.parentId)) {
            requeue.add(id);
            continue;
        }
        const selfAndSiblingIds = getSubtaskIds(state, task.parentId);
        const idx = indexOfBfsId(selfAndSiblingIds, id);
        const afterId = idx === 0 ? null : selfAndSiblingIds[idx - 1];
        if (ClientId.is(afterId)) {
            requeue.add(id);
            continue;
        }
        PlanApi.createItem(state.activeListId!, {
            id,
            parentId: task.parentId,
            afterId,
            name: task.name,
        });
    }
    tasksToRename = requeue;
    if (requeue.size > 0) inTheFuture(PlanActions.FLUSH_RENAMES);
    return state;
};

const mapTaskLO = (state: State, id, work) =>
    dotProp.set(state, ["byId", id], (lo) => {
        // dotProp will give us an anonymous object literal on a missing key...
        if (!(lo instanceof LoadObject)) {
            lo = LoadObject.empty();
        }
        return work(lo);
    });

export const mapTask = (state: State, id, work) =>
    mapTaskLO(state, id, (lo) => lo.map(work));

export const renameTask = (state: State, id, name) =>
    mapTaskLO(state, id, (lo) => {
        if (lo.isDone()) {
            lo = ClientId.is(id) ? lo.creating() : lo.updating();
        }
        tasksToRename.add(id);
        inTheFuture(PlanActions.FLUSH_RENAMES);
        return lo.map((t) => ({
            ...t,
            name,
        }));
    });

export const setPlanColor = (state: State, id, color) =>
    mapTaskLO(state, id, (lo) => {
        PlanApi.setPlanColor(id, color);
        return lo
            .map((t) => ({
                ...t,
                color,
            }))
            .updating();
    });

export const assignToBucket = (
    state: State,
    id: BfsId,
    bucketId: BfsId | null,
) => {
    if (ClientId.is(id)) return state;
    PlanApi.assignBucket(id, bucketId);
    return mapTask(state, id, (t) => ({
        ...t,
        bucketId,
    }));
};

export const focusTask = (state: State, id) => {
    taskForId(state, id);
    if (bfsIdEq(state.activeTaskId, id)) return state;
    return {
        ...state,
        activeTaskId: id,
        selectedTaskIds: undefined,
    };
};

const getNeighborId = (
    state,
    id,
    delta = 1,
    crossGenerations = false,
    _searching = false,
) => {
    invariant(delta === 1 || delta === -1, "Delta must be either 1 or -1");
    const t = taskForId(state, id);
    if (t.parentId == null) return null;
    const siblingIds = getSubtaskIds(state, t.parentId);
    const idx = indexOfBfsId(siblingIds, id);
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
        if (crossGenerations && !bfsIdEq(t.parentId, state.activeListId))
            return t.parentId;
        return null;
    }
};

const lastDescendantIdOf = (state: State, id) => {
    while (id != null) {
        const desc = taskForId(state, id);
        if (!isExpanded(desc)) return desc.id;
        id = desc.subtaskIds![desc.subtaskIds!.length - 1];
    }
    return null;
};

export const focusDelta = (state: State, id, delta) => {
    if (delta === 0) return state;
    const sid = getNeighborId(state, id, delta, true);
    if (sid == null) return state;
    return focusTask(state, sid);
};

export const selectTo = (state: State, id) => {
    if (state.activeTaskId == null) return focusTask(state, id);
    if (bfsIdEq(id, state.activeTaskId)) return state;
    const target = taskForId(state, id);
    const siblingIds = getSubtaskIds(state, target.parentId);
    let i = indexOfBfsId(siblingIds, state.activeTaskId);
    let j = indexOfBfsId(siblingIds, id);
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
};

export const selectDelta = (state: State, id, delta) => {
    const next = getNeighborId(state, id, delta, false);
    if (next == null) return state; // there's no neighbor
    if (state.selectedTaskIds == null) {
        // starting to select
        return {
            ...focusTask(state, next),
            selectedTaskIds: [id],
        };
    }
    const idx = indexOfBfsId(state.selectedTaskIds, next);
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
};

const statusUpdatesToFlush = new Map<BfsStringId, StatusChange>();

const unqueueTaskId = (id) => {
    tasksToRename.delete(id);
    statusUpdatesToFlush.delete(id);
};

const doTaskDelete = (state: State, id: BfsStringId) => {
    unqueueTaskId(id);
    PlanApi.deleteItem(id);
    return state;
};

export const flushStatusUpdates = (state: State) => {
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
        inTheFuture(PlanActions.FLUSH_STATUS_UPDATES, 0.5);
    }
    return state;
};

export const queueDelete = (state: State, id) => {
    if (!isKnown(state, id)) return state; // already gone...
    return queueStatusUpdate(state, id, { status: PlanItemStatus.Deleted });
};

function isEmpty(taskOrString) {
    if (taskOrString == null) return true;
    const str =
        typeof taskOrString === "string" ? taskOrString : taskOrString.name;
    return str == null || str.trim() === "";
}

export const queueStatusUpdate = (
    state: State,
    id: BfsStringId,
    change: StatusChange,
) => {
    const { status } = change;
    const lo = loForId(state, id);
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
        statusUpdatesToFlush.delete(ensureString(t.id));
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
        inTheFuture(PlanActions.FLUSH_STATUS_UPDATES, 4);
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
    if (bfsIdEq(state.activeListId, id)) {
        state.activeTaskId = undefined;
    }
    if (state.selectedTaskIds) {
        state.selectedTaskIds = state.selectedTaskIds.filter(
            (it) => !bfsIdEq(it, id),
        );
    }
    return state;
};

export const cancelStatusUpdate = (state: State, id) => {
    if (!statusUpdatesToFlush.has(id)) return state;
    statusUpdatesToFlush.delete(id);
    return mapTaskLO(state, id, (lo) =>
        lo
            .map((t) => {
                t = { ...t };
                delete t._next_status;
                return t;
            })
            .done(),
    );
};

export const taskDeleted = (state: State, id) => {
    unqueueTaskId(id);
    if (!isKnown(state, id)) return state;
    const t = taskForId(state, id);
    let p = taskForId(state, t.parentId);
    const siblingIds = p.subtaskIds!;
    const idx = indexOfBfsId(siblingIds, id);
    p = {
        ...p,
        subtaskIds: siblingIds.slice(0, idx).concat(siblingIds.slice(idx + 1)),
    };
    const byId = { ...state.byId };
    byId[p.id] = byId[p.id].setValue(p);
    const kill = (id) => {
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
    if (!isKnown(state, state.activeTaskId)) {
        state = {
            ...state,
            activeTaskId: undefined,
        };
    }
    if (bfsIdEq(p.id, state.activeListId) && !isParent(p)) {
        // it was the last task on the list
        state = addTask(state, p.id, "", AT_END);
    }
    return state;
};

/**
 * I return an array of [task, parent, index] tuples for the active task(s).
 */
export const getOrderedBlock = (state: State) => {
    const block = [state.activeTaskId];
    if (state.selectedTaskIds != null) {
        block.push(...state.selectedTaskIds);
    }
    return block
        .map((id) => taskForId(state, id))
        .map((t) => [t, taskForId(state, t.parentId)])
        .map(([t, p]): [PlanItem, PlanItem, number] => [
            t,
            p,
            indexOfBfsId(p.subtaskIds!, t.id),
        ])
        .sort((a, b) => a[2] - b[2]);
};

export const moveDelta = (state: State, delta) => {
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
};

const subtaskIdBefore = (state: State, parentId, before) => {
    const p = taskForId(state, parentId);
    if (!p.subtaskIds || p.subtaskIds.length === 0) return null;
    const idx = indexOfBfsId(p.subtaskIds, before);
    if (idx < 0) return p.subtaskIds[p.subtaskIds.length - 1];
    if (idx === 0) return null;
    return p.subtaskIds[idx - 1];
};

export const moveSubtree = (state: State, action) => {
    let blockIds = getOrderedBlock(state).map(([t]) => t.id);
    const afterId = action.hasOwnProperty("before")
        ? subtaskIdBefore(state, action.parentId, action.before)
        : action.after == null
        ? null
        : action.after;
    if (
        includesBfsId(blockIds, action.parentId) ||
        includesBfsId(blockIds, afterId)
    ) {
        // dragging into the selection, so unselect
        state = {
            ...state,
            selectedTaskIds: undefined,
        };
        blockIds = [state.activeTaskId!];
    }
    if (!includesBfsId(blockIds, action.id)) {
        blockIds = [action.id];
    }
    return mutateTree(state, {
        ids: blockIds,
        parentId: action.parentId,
        afterId,
    });
};

const mutateTree = (state: State, spec) => {
    /*
  Spec is {ids, parentId, afterId}
   */
    // ensure no client IDs
    if (spec.ids.some((id) => ClientId.is(id))) return state;
    if (ClientId.is(spec.parentId)) return state;
    if (ClientId.is(spec.afterId)) return state;
    // ensure we're not going to create a cycle
    for (let id = spec.parentId; id; id = taskForId(state, id).parentId) {
        if (includesBfsId(spec.ids, id)) return state;
    }
    // ensure we're not positioning something based on itself
    if (includesBfsId(spec.ids, spec.afterId)) return state;
    PlanApi.mutateTree(state.activeListId!, spec);
    // do it now so the UI updates; the future delta will be a race-y no-op
    return treeMutated(state, spec);
};

const treeMutated = (state: State, spec) => {
    // Woo! GO GO GO!
    const byId = { ...state.byId };
    spec.ids.reduce((afterId, id) => {
        const lo = byId[id];
        // remove the task from its old parent
        const oldPid = byId[id].getValueEnforcing().parentId;
        byId[oldPid] = byId[oldPid].map((t) => {
            const ids = t.subtaskIds!;
            const idx = indexOfBfsId(ids, id);
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
                    afterId == null ? 0 : indexOfBfsId(subtaskIds, afterId) + 1;
                const currIdx = indexOfBfsId(subtaskIds, id);
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
        return id;
    }, spec.afterId);
    return {
        ...state,
        byId,
    };
};

export const nestTask = (state: State) => {
    const block = getOrderedBlock(state);
    if (block.some(([t, p]) => indexOfBfsId(p.subtaskIds!, t.id) === 0)) {
        // nothing to nest under
        return state;
    }
    const [t, p] = block[0];
    const subtaskIds = p.subtaskIds!;
    const idx = indexOfBfsId(subtaskIds, t.id);
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
};

// if expanded is null, it means "toggle it"
const setExpansion = (state: State, id, expanded = false) =>
    dotProp.set(state, ["byId", id], (lo) =>
        lo.map((t) => ({
            ...t,
            _expanded: !expanded ? !t._expanded : expanded,
        })),
    );

export const unnestTask = (state: State) => {
    const block = getOrderedBlock(state);
    if (block.some(([t]) => bfsIdEq(t.parentId, state.activeListId))) {
        // nothing to unnest from
        return state;
    }
    const p = block[block.length - 1][1];
    return mutateTree(state, {
        ids: block.map(([t]) => t.id),
        parentId: p.parentId,
        afterId: p.id,
    });
};

export const toggleExpanded = (state: State, id) => {
    // if toggling a non-parent, that means "collapse my parent"
    const t = taskForId(state, id);
    if (!isParent(t)) {
        if (bfsIdEq(t.parentId, state.activeListId)) {
            // we don't do the plan
            return state;
        }
        id = t.parentId;
        state = focusTask(state, id);
    }
    return setExpansion(state, id);
};

const forceExpansionBuilder = (expanded) => {
    const work = (state: State, id) => {
        const lo = loForId(state, id);
        if (!lo.hasValue()) return state;
        const t = lo.getValueEnforcing();
        if (!isParent(t)) return state;
        state = setExpansion(state, t.id, expanded);
        return t.subtaskIds!.reduce(work, state);
    };
    return (state) => {
        if (state.activeListId == null) return state;
        return work(state, state.activeListId);
    };
};

export const expandAll = forceExpansionBuilder(true);
export const collapseAll = forceExpansionBuilder(false);

export const taskLoaded = (state: State, task) => {
    if (task.acl) {
        task = {
            ...task,
            buckets: task.buckets ? task.buckets.sort(bucketComparator) : [],
        };
    }
    let lo = state.byId[task.id] || LoadObject.empty();
    if (task.ingredientId != null) {
        task.ingredientId = ensureString(task.ingredientId);
    }
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
                name: bfsIdEq(task.id, state.activeTaskId) ? t.name : task.name,
                subtaskIds: subtaskIds.length ? subtaskIds : null,
            };
            if (t.status === t._next_status) {
                // it worked!
                delete t._next_status;
            }
            return t;
        });
    } else {
        lo = lo.setValue(task);
    }
    return dotProp.set(state, ["byId", task.id], lo.done());
};

const taskLoading = (state: State, id) => {
    return dotProp.set(state, ["byId", id], (lo) =>
        lo instanceof LoadObject ? lo.loading() : LoadObject.loading(),
    );
};

export const loadLists = (state: State) => {
    TaskApi.loadLists();
    return {
        ...state,
        topLevelIds: state.topLevelIds.mapLO((lo) => lo.loading()),
    };
};

export const tasksLoaded = (state: State, tasks) =>
    tasks.reduce((s, t) => taskLoaded(s, t), state);

export function selectDefaultList(state: State): State {
    const listIds = state.topLevelIds.getLoadObject().getValueEnforcing();
    if (listIds.length > 0) {
        // see if there's a preferred active plan
        let activePlanId = preferencesStore.getActivePlan();
        if (listIds.find((id) => bfsIdEq(id, activePlanId)) == null) {
            // auto-select the first one, if there is one
            activePlanId = listIds[0];
        }
        state = selectList(state, activePlanId);
    }
    return state;
}

export const listsLoaded = (state: State, lists) => {
    state = {
        ...tasksLoaded(state, lists),
        topLevelIds: state.topLevelIds.setLoadObject(
            LoadObject.withValue(lists.map((t) => t.id)),
        ),
    };
    state = selectDefaultList(state);
    return state;
};

export const mapPlanBuckets = (
    state: State,
    planId: BfsId,
    work: (buckets: PlanBucket[]) => PlanBucket[],
): State =>
    dotProp.set(state, ["byId", planId], (lo) =>
        lo.map((t) => ({
            ...t,
            buckets: work(t.buckets || []),
        })),
    );

export const saveBucket = (state: State, bucket: PlanBucket) => {
    ClientId.is(bucket.id)
        ? PlanApi.createBucket(state.activeListId!, bucket)
        : PlanApi.updateBucket(state.activeListId!, bucket.id, bucket);
};

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
        if (toDelete.length > 0) {
            PlanApi.deleteBuckets(planId, toDelete);
        }
        for (const d of desiredDates) {
            const b = {
                id: ClientId.next(),
                date: new Date(d),
            };
            saveBucket(state, b);
            result.push(b);
        }
        return result.sort(bucketComparator);
    });
}

export const doInteractiveStatusChange = (
    state: State,
    id: BfsStringId,
    change: StatusChange,
) => {
    if (willStatusDelete(change.status) && bfsIdEq(id, state.activeTaskId)) {
        state = focusDelta(state, id, 1);
    }
    return queueStatusUpdate(state, id, change);
};
