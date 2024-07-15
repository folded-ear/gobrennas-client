import ClientId from "util/ClientId";
import PlanItemStatus, {
    willStatusDelete,
} from "features/Planner/data/PlanItemStatus";
import TaskApi from "features/Planner/data/TaskApi";
import LoadObject from "util/LoadObject";
import LoadObjectState from "util/LoadObjectState";
import { isExpanded, isParent } from "features/Planner/data/plannerUtils";
import invariant from "invariant/invariant";
import PlanApi from "features/Planner/data/PlanApi";
import inTheFuture from "util/inTheFuture";
import PlanActions from "features/Planner/data/PlanActions";
import dotProp from "dot-prop-immutable";
import { bucketComparator } from "util/comparators";
import preferencesStore from "data/preferencesStore";
import { formatLocalDate, parseLocalDate } from "util/time";
import { PlanBucket, WireBucket } from "./planStore";
import { BfsId } from "global/types/identity";

export const AT_END = Math.random();

export const _newTask = (name) => ({
    id: ClientId.next(),
    name,
    status: PlanItemStatus.NEEDED,
});

export const createList = (state, name, optionalPlanIdToCopy) => {
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

export const idFixerFactory = (cid, id) => {
    const idFixer = (ids) => {
        if (ids == null) return null;
        if (ids === cid) return id;
        if (ids instanceof Array) {
            return ids.map((v) => (v === cid ? id : v));
        }
        if (ids instanceof LoadObject) return ids.map(idFixer);
        if (ids instanceof LoadObjectState) return ids.map(idFixer);
        if (typeof ids === "string") return ids;
        if (typeof ids === "number") return ids;
        throw new Error("Unsupported value passed to replaceId: " + ids);
    };
    return idFixer;
};

export const fixIds = (state, task, id, clientId) => {
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

export const tasksCreated = (state, tasks, newIds) => {
    if (newIds != null) {
        for (const id of Object.keys(newIds)) {
            const cid = newIds[id];
            if (!isKnown(state, cid)) continue;
            state = fixIds(state, taskForId(state, cid), parseInt(id, 10), cid);
        }
    }
    return tasksLoaded(state, tasks);
};

export const listCreated = (state, clientId, id, list) => {
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

export const selectList = (state, id) => {
    if (state.activeListId === id) return state;
    // flush any yet-unsaved changes
    state = flushTasksToRename(state);
    // only valid ids, please
    invariant(
        state.topLevelIds
            .getLoadObject()
            .getValueEnforcing()
            .some((it) => it === id),
        `Task '${id}' is not a list.`,
    );
    const list = taskForId(state, id);
    state = {
        ...state,
        activeListId: id,
        listDetailVisible: false,
    };
    if (list.subtaskIds && list.subtaskIds.length) {
        state = list.subtaskIds.reduce(taskLoading, {
            ...state,
            activeTaskId: list.subtaskIds[0],
        });
    } else {
        state = addTask(state, id, "");
    }
    PlanApi.getDescendantsAsList(state.activeListId);
    return state;
};

export const isKnown = (state, id) => state.byId.hasOwnProperty(id);

export const taskForId = (state, id) => loForId(state, id).getValueEnforcing();

export const loForId = (state, id) => {
    invariant(id != null, "No task has a null id.");
    const lo = state.byId[id] || LoadObject.empty();
    lo.id = id; // kludge for pre-load react keys
    return lo;
};

export const tasksForIds = (state, ids) =>
    losForIds(state, ids).map((lo) => lo.getValueEnforcing());

export const losForIds = (state, ids) =>
    ids == null ? [] : ids.map((id) => loForId(state, id));

// after can be `null`, an id, or the magic `AT_END` value
export const spliceIds = (ids, id, after = AT_END) => {
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
};

export const addTask = (state, parentId, name, after = AT_END) => {
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

export const addTaskAndFlush = (state, parentId, name, after = AT_END) => {
    state = addTask(state, parentId, name, after);
    tasksToRename.add(state.activeTaskId);
    return flushTasksToRename(state);
};

export const createTaskAfter = (state, id) => {
    const t = taskForId(state, id);
    invariant(
        t.parentId != null,
        `Can't create a task after root-level '${id}'`,
    );
    state = addTask(state, t.parentId, "", id);
    return state;
};

export const createTaskBefore = (state, id) => {
    const t = taskForId(state, id);
    invariant(
        t.parentId != null,
        `Can't create a task before root-level '${id}'`,
    );
    const p = taskForId(state, t.parentId);
    let afterId = AT_END; // implied first
    if (p.subtaskIds != null) {
        const idx = p.subtaskIds.indexOf(id);
        if (idx > 0) {
            afterId = p.subtaskIds[idx - 1];
        }
    }
    state = addTask(state, t.parentId, "", afterId);
    return state;
};

let tasksToRename: Set<number> = new Set();

export const flushTasksToRename = (state) => {
    if (tasksToRename.size === 0) return state;
    const requeue: Set<number> = new Set();
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
        const parent = taskForId(state, task.parentId);
        const idx = parent.subtaskIds.indexOf(id);
        const afterId = idx === 0 ? null : parent.subtaskIds[idx - 1];
        if (ClientId.is(afterId)) {
            requeue.add(id);
            continue;
        }
        PlanApi.createItem(state.activeListId, {
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

export const mapTaskLO = (state, id, work) =>
    dotProp.set(state, ["byId", id], (lo) => {
        // dotProp will give us an anonymous object literal on a missing key...
        if (!(lo instanceof LoadObject)) {
            lo = LoadObject.empty();
        }
        return work(lo);
    });

export const mapTask = (state, id, work) =>
    mapTaskLO(state, id, (lo) => lo.map(work));

export const renameTask = (state, id, name) =>
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

export const assignToBucket = (state, id, bucketId) => {
    if (ClientId.is(id)) return state;
    PlanApi.assignBucket(state.activeListId, id, bucketId);
    return mapTask(state, id, (t) => ({
        ...t,
        bucketId,
    }));
};

export const focusTask = (state, id) => {
    taskForId(state, id);
    if (state.activeTaskId === id) return state;
    return {
        ...state,
        activeTaskId: id,
        selectedTaskIds: null,
    };
};

export const getNeighborId = (
    state,
    id,
    delta = 1,
    crossGenerations = false,
    _searching = false,
) => {
    invariant(delta === 1 || delta === -1, "Deltas must be either 1 or -1");
    const t = taskForId(state, id);
    if (t.parentId == null) return null;
    const siblingIds = taskForId(state, t.parentId).subtaskIds;
    const idx = siblingIds.indexOf(id);
    invariant(
        idx >= 0,
        `Task '${t.id}' isn't a child of it's parent ('${t.parentId}')?`,
    );

    if (delta > 0) {
        // to first child
        if (crossGenerations && isExpanded(t)) return t.subtaskIds[0];
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
};

export const lastDescendantIdOf = (state, id) => {
    while (id != null) {
        const desc = taskForId(state, id);
        if (!isExpanded(desc)) return desc.id;
        id = desc.subtaskIds[desc.subtaskIds.length - 1];
    }
    return null;
};

export const focusDelta = (state, id, delta) => {
    if (delta === 0) return state;
    const sid = getNeighborId(state, id, delta, true);
    if (sid == null) return state;
    return focusTask(state, sid);
};

export const selectTo = (state, id) => {
    if (state.activeTaskId == null) return focusTask(state, id);
    if (id === state.activeTaskId) return state;
    const target = taskForId(state, id);
    const parent = taskForId(state, target.parentId);
    let i = parent.subtaskIds.indexOf(state.activeTaskId);
    let j = parent.subtaskIds.indexOf(id);
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
        selectedTaskIds: parent.subtaskIds.slice(i, j),
    };
};

export const selectDelta = (state, id, delta) => {
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
};

const statusUpdatesToFlush = new Map();

export const unqueueTaskId = (id) => {
    tasksToRename.delete(id);
    statusUpdatesToFlush.delete(id);
};

export const doTaskDelete = (state, id: number) => {
    unqueueTaskId(id);
    PlanApi.deleteItem(id);
    return state;
};

export const setTaskStatus = (state, id, status) => {
    if (willStatusDelete(status)) {
        unqueueTaskId(id);
    }
    PlanApi.updateItemStatus(state.activeListId, {
        id,
        status,
    });
    return state;
};

export const flushStatusUpdates = (state) => {
    if (statusUpdatesToFlush.size === 0) return state;
    const [id, status] = statusUpdatesToFlush.entries().next().value; // the next value of the iterator, not the value of the entry!
    state = setTaskStatus(state, id, status);
    statusUpdatesToFlush.delete(id);
    if (statusUpdatesToFlush.size > 0) {
        inTheFuture(PlanActions.FLUSH_STATUS_UPDATES, 1);
    }
    return state;
};

export const queueDelete = (state, id) => {
    if (!isKnown(state, id)) return state; // already gone...
    return queueStatusUpdate(state, id, PlanItemStatus.DELETED);
};

export function isEmpty(taskOrString) {
    if (taskOrString == null) return true;
    const str =
        typeof taskOrString === "string" ? taskOrString : taskOrString.name;
    return str == null || str.trim() === "";
}

export const queueStatusUpdate = (state, id, status) => {
    const lo = loForId(state, id);
    const t = lo.getValueEnforcing();
    invariant(
        t.parentId != null,
        "Can't change root-level task '%s' to %s",
        id,
        status,
    );
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
        statusUpdatesToFlush.set(id, status);
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
    if (state.activeListId === id) {
        state.activeTaskId = null;
    }
    if (state.selectedTaskIds) {
        state.selectedTaskIds = state.selectedTaskIds.filter((it) => it !== id);
    }
    return state;
};

export const cancelStatusUpdate = (state, id) => {
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

export const taskDeleted = (state, id) => {
    unqueueTaskId(id);
    if (!isKnown(state, id)) return state;
    const t = taskForId(state, id);
    let p = taskForId(state, t.parentId);
    const idx = p.subtaskIds.indexOf(id);
    p = {
        ...p,
        subtaskIds: p.subtaskIds
            .slice(0, idx)
            .concat(p.subtaskIds.slice(idx + 1)),
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
            activeTaskId: null,
        };
    }
    if (p.id === state.activeListId && !isParent(p)) {
        // it was the last task on the list
        state = addTask(state, p.id, "", AT_END);
    }
    return state;
};

/**
 * I return an array of [task, parent, index] tuples for the active task(s).
 */
export const getOrderedBlock = (state) => {
    const block = [state.activeTaskId];
    if (state.selectedTaskIds != null) {
        block.push(...state.selectedTaskIds);
    }
    return block
        .map((id) => taskForId(state, id))
        .map((t) => [t, taskForId(state, t.parentId)])
        .map(([t, p]) => [t, p, p.subtaskIds.indexOf(t.id)])
        .sort((a, b) => a[2] - b[2]);
};

export const moveDelta = (state, delta) => {
    const upward = delta < 1;
    const block = getOrderedBlock(state);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ignored, p, idx] = block[upward ? 0 : block.length - 1];
    if (upward && idx === 0) return state;
    if (!upward && idx === p.subtaskIds.length - 1) return state;
    const afterId = p.subtaskIds[idx + delta + (upward ? -1 : 0)];
    return mutateTree(state, {
        ids: block.map(([t]) => t.id),
        parentId: p.id,
        afterId,
    });
};

export const subtaskIdBefore = (state, parentId, before) => {
    const p = taskForId(state, parentId);
    if (!p.subtaskIds || p.subtaskIds.length === 0) return null;
    const idx = p.subtaskIds.indexOf(before);
    if (idx < 0) return p.subtaskIds[p.subtaskIds.length - 1];
    if (idx === 0) return null;
    return p.subtaskIds[idx - 1];
};

export const moveSubtree = (state, action) => {
    let blockIds = getOrderedBlock(state).map(([t]) => t.id);
    const afterId = action.hasOwnProperty("before")
        ? subtaskIdBefore(state, action.parentId, action.before)
        : action.after == null
        ? null
        : action.after;
    if (blockIds.includes(action.parentId) || blockIds.includes(afterId)) {
        // dragging into the selection, so unselect
        state = {
            ...state,
            selectedTaskIds: null,
        };
        blockIds = [state.activeTaskId];
    }
    if (!blockIds.includes(action.id)) {
        blockIds = [action.id];
    }
    return mutateTree(state, {
        ids: blockIds,
        parentId: action.parentId,
        afterId,
    });
};

export const mutateTree = (state, spec) => {
    /*
  Spec is {ids, parentId, afterId}
   */
    // ensure no client IDs
    if (spec.ids.some((id) => ClientId.is(id))) return state;
    if (ClientId.is(spec.parentId)) return state;
    if (ClientId.is(spec.afterId)) return state;
    // ensure we're not going to create a cycle
    for (let id = spec.parentId; id; id = taskForId(state, id).parentId) {
        if (spec.ids.includes(id)) return state;
    }
    // ensure we're not positioning something based on itself
    if (spec.ids.some((id) => id === spec.afterId)) return state;
    PlanApi.mutateTree(state.activeListId, spec);
    // do it now so the UI updates; the future delta will be a race-y no-op
    return treeMutated(state, spec);
};

export const treeMutated = (state, spec) => {
    // Woo! GO GO GO!
    const byId = { ...state.byId };
    spec.ids.reduce((afterId, id) => {
        const lo = byId[id];
        // remove the task from its old parent
        const oldPid = byId[id].getValueEnforcing().parentId;
        byId[oldPid] = byId[oldPid].map((t) => {
            const idx = t.subtaskIds.indexOf(id);
            if (idx < 0) return t;
            const subtaskIds = t.subtaskIds.slice();
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
        return id;
    }, spec.afterId);
    return {
        ...state,
        byId,
    };
};

export const nestTask = (state) => {
    const block = getOrderedBlock(state);
    if (block.some(([t, p]) => p.subtaskIds.indexOf(t.id) === 0)) {
        // nothing to nest under
        return state;
    }
    const [t, p] = block[0];
    const idx = p.subtaskIds.indexOf(t.id);
    const np = taskForId(state, p.subtaskIds[idx - 1]);
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
export const setExpansion = (state, id, expanded = false) =>
    dotProp.set(state, ["byId", id], (lo) =>
        lo.map((t) => ({
            ...t,
            _expanded: !expanded ? !t._expanded : expanded,
        })),
    );

export const unnestTask = (state) => {
    const block = getOrderedBlock(state);
    if (block.some(([t]) => t.parentId === state.activeListId)) {
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

export const toggleExpanded = (state, id) => {
    // if toggling a non-parent, that means "collapse my parent"
    const t = taskForId(state, id);
    if (!isParent(t)) {
        if (t.parentId === state.activeListId) {
            // we don't do the plan
            return state;
        }
        id = t.parentId;
        state = focusTask(state, id);
    }
    return setExpansion(state, id);
};

export const forceExpansionBuilder = (expanded) => {
    const work = (state, id) => {
        const lo = loForId(state, id);
        if (!lo.hasValue()) return state;
        const t = lo.getValueEnforcing();
        if (!isParent(t)) return state;
        state = setExpansion(state, t.id, expanded);
        return t.subtaskIds.reduce(work, state);
    };
    return (state) => {
        if (state.activeListId == null) return state;
        return work(state, state.activeListId);
    };
};

export const expandAll = forceExpansionBuilder(true);
export const collapseAll = forceExpansionBuilder(false);

export const taskLoaded = (state, task) => {
    if (task.buckets) {
        task = {
            ...task,
            buckets: task.buckets.map(deserializeBucket).sort(bucketComparator),
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

export const taskLoading = (state, id) => {
    return dotProp.set(state, ["byId", id], (lo) =>
        lo instanceof LoadObject ? lo.loading() : LoadObject.loading(),
    );
};

export const loadLists = (state) => {
    TaskApi.loadLists();
    return {
        ...state,
        topLevelIds: state.topLevelIds.mapLO((lo) => lo.loading()),
    };
};

export const tasksLoaded = (state, tasks) =>
    tasks.reduce((s, t) => taskLoaded(s, t), state);

export function selectDefaultList(state) {
    const listIds = state.topLevelIds.getLoadObject().getValueEnforcing();
    if (listIds.length > 0) {
        // see if there's a preferred active plan
        let activePlanId = preferencesStore.getActivePlan();
        if (listIds.find((id) => id === activePlanId) == null) {
            // auto-select the first one
            activePlanId = listIds[0]; // todo: select MY first one, if I have any
        }
        state = selectList(state, activePlanId);
    }
    return state;
}

export const listsLoaded = (state, lists) => {
    state = {
        ...tasksLoaded(state, lists),
        topLevelIds: state.topLevelIds.setLoadObject(
            LoadObject.withValue(lists.map((t) => t.id)),
        ),
    };
    state = selectDefaultList(state);
    return state;
};

export const mapPlanBuckets = (state, planId, work) =>
    dotProp.set(state, ["byId", planId], (lo) =>
        lo.map((t) => ({
            ...t,
            buckets: work(t.buckets || []),
        })),
    );

export function deserializeBucket(b: WireBucket): PlanBucket {
    return { ...b, date: parseLocalDate(b.date) };
}

export function serializeBucket(b: PlanBucket): WireBucket {
    return { ...b, date: formatLocalDate(b.date) };
}

export const saveBucket = (state, bucket: PlanBucket) => {
    const wireBucket = serializeBucket(bucket);
    ClientId.is(bucket.id)
        ? PlanApi.createBucket(state.activeListId, wireBucket)
        : PlanApi.updateBucket(state.activeListId, bucket.id, wireBucket);
};

// T should be PlanStore.TState...
export function resetToThisWeeksBuckets<T>(state: T, planId: number): T {
    return mapPlanBuckets(state, planId, (buckets) => {
        const result: PlanBucket[] = [];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const today = parseLocalDate(formatLocalDate(new Date()))!.valueOf();
        const desiredDates = new Set<number>();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            desiredDates.add(date.valueOf());
        }
        const toDelete: BfsId[] = [];
        for (const b of buckets) {
            if (b.date && desiredDates.has(b.date.valueOf())) {
                desiredDates.delete(b.date.valueOf());
                result.push(b);
            } else if (!ClientId.is(b.id)) {
                toDelete.push(b.id);
            }
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

export const doInteractiveStatusChange = (state, id, status) => {
    if (willStatusDelete(status) && id === state.activeTaskId) {
        state = focusDelta(state, id, 1);
    }
    return queueStatusUpdate(state, id, status);
};
