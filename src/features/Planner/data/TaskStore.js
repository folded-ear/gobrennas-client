import dotProp from "dot-prop-immutable";
import { ReduceStore } from "flux/utils";
import invariant from "invariant";
import PropTypes from "prop-types";
import { removeAtIndex } from "util/arrayAsSet";
import ClientId, { clientOrDatabaseIdType } from "util/ClientId";
import { bucketComparator } from "util/comparators";
import inTheFuture from "util/inTheFuture";
import LoadObject from "util/LoadObject";
import LoadObjectState from "util/LoadObjectState";
import {
    loadObjectOf,
    loadObjectStateOf,
} from "util/loadObjectTypes";
import {
    formatLocalDate,
    parseLocalDate,
} from "util/time";
import typedStore from "util/typedStore";
import AccessLevel from "data/AccessLevel";
import Dispatcher from "data/dispatcher";
import PantryItemActions from "data/PantryItemActions";
import PreferencesStore from "data/PreferencesStore";
import ShoppingActions from "data/ShoppingActions";
import TaskActions from "features/Planner/data/TaskActions";
import TaskApi from "features/Planner/data/TaskApi";
import {
    isExpanded,
    isParent,
} from "features/Planner/data/tasks";
import TaskStatus, { willStatusDelete } from "features/Planner/data/TaskStatus";
import PlanApi from "./PlanApi";

/*
 * This store is way too muddled. But leaving it that way for the moment, to
 * avoid introducing too much "spray" during the early stages. It can be chopped
 * up in the future.
 */

const AT_END = Math.random();

const _newTask = name => ({
    id: ClientId.next(),
    name,
    status: TaskStatus.NEEDED,
});

const createList = (state, name, optionalPlanIdToCopy) => {
    const task = _newTask(name);
    TaskApi.createList(name, task.id, optionalPlanIdToCopy);
    return {
        ...mapTaskLO(state, task.id, () =>
            LoadObject.withValue(task).creating()),
        activeListId: task.id,
        activeTaskId: null,
        topLevelIds: state.topLevelIds.map(ids => ids.concat(task.id)),
    };
};

const idFixerFactory = (cid, id) => {
    const idFixer = ids => {
        if (ids == null) return null;
        if (ids === cid) return id;
        if (ids instanceof Array) {
            return ids.map(v =>
                v === cid ? id : v);
        }
        if (ids instanceof LoadObject) return ids.map(idFixer);
        if (ids instanceof LoadObjectState) return ids.map(idFixer);
        if (typeof ids === "string") return ids;
        if (typeof ids === "number") return ids;
        throw new Error("Unsupported value passed to replaceId: " + ids);
    };
    return idFixer;
};

const fixIds = (state, task, id, clientId) => {
    const idFixer = idFixerFactory(clientId, id);
    const byId = {
        ...state.byId,
        [id]: state.byId[clientId].map(t => ({
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
        byId[task.parentId] = plo.map(p => ({
            ...p,
            subtaskIds: idFixer(p.subtaskIds),
        }));
    }
    if (isParent(task)) {
        task.subtaskIds.forEach(sid => {
            byId[sid] = byId[sid].map(s => ({
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

const tasksCreated = (state, tasks, newIds) => {
    if (newIds != null) {
        for (const id of Object.keys(newIds)) {
            const cid = newIds[id];
            if (!isKnown(state, cid)) continue;
            state = fixIds(state, taskForId(state, cid), parseInt(id, 10), cid);
        }
    }
    return tasksLoaded(state, tasks);
};

const listCreated = (state, clientId, id, list) => {
    const idFixer = idFixerFactory(clientId, id);
    const byId = {
        ...state.byId,
        [id]: LoadObject.withValue(list),
    };
    delete byId[clientId];
    state = addTask({
        ...state,
        topLevelIds: idFixer(state.topLevelIds),
        byId,
    }, id, "");
    state = selectList(state, idFixer(state.activeListId));
    return state;
};

const selectList = (state, id) => {
    if (state.activeListId === id) return state;
    // only valid ids, please
    const list = taskForId(state, id);
    invariant(
        state.topLevelIds.getLoadObject()
            .getValueEnforcing()
            .some(it => it === id),
        `Task '${id}' is not a list.`,
    );
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

const isKnown = (state, id) =>
    state.byId.hasOwnProperty(id);

const taskForId = (state, id) =>
    loForId(state, id).getValueEnforcing();

const loForId = (state, id) => {
    invariant(id != null, "No task has a null id.");
    const lo = state.byId[id];
    invariant(lo != null, `No task '${id}' is known. You have a load race!`);
    lo.id = id; // kludge for pre-load react keys
    return lo;
};

const tasksForIds = (state, ids) =>
    losForIds(state, ids).map(lo =>
        lo.getValueEnforcing());

const losForIds = (state, ids) =>
    ids == null ? [] : ids.map(id =>
        loForId(state, id));

// after can be `null`, an id, or the magic `AT_END` value
const spliceIds = (ids, id, after = AT_END) => {
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

const addTask = (state, parentId, name, after = AT_END) => {
    const task = _newTask(name);
    state = mapTask(state, parentId, p => ({
        ...p,
        subtaskIds: spliceIds(p.subtaskIds, task.id, after),
    }));
    state = mapTaskLO(state, task.id, () =>
        LoadObject.withValue({
            ...task,
            parentId,
        }));
    return {
        ...state,
        activeTaskId: task.id,
    };
};

const addTaskAndFlush = (state, parentId, name, after = AT_END) => {
    state = addTask(state, parentId, name, after);
    tasksToRename.add(state.activeTaskId);
    return flushTasksToRename(state);
};

const createTaskAfter = (state, id) => {
    const t = taskForId(state, id);
    invariant(
        t.parentId != null,
        `Can't create a task after root-level '${id}'`,
    );
    state = addTask(state, t.parentId, "", id);
    return state;
};

const createTaskBefore = (state, id) => {
    const t = taskForId(state, id);
    invariant(
        t.parentId != null,
        `Can't create a task before root-level '${id}'`,
    );
    const p = taskForId(state, t.parentId);
    let afterId = null; // implied first
    if (p.subtaskIds != null) {
        const idx = p.subtaskIds.indexOf(id);
        if (idx > 0) {
            afterId = p.subtaskIds[idx - 1];
        }
    }
    state = addTask(state, t.parentId, "", afterId);
    return state;
};

let tasksToRename = new Set();

const flushTasksToRename = state => {
    if (tasksToRename.size === 0) return state;
    const requeue = new Set();
    for (const id of tasksToRename) {
        const task = taskForId(state, id);
        if (!ClientId.is(id)) {
            PlanApi.renameItem(state.activeListId, {
                id,
                name: task.name,
            });
            continue;
        }
        if (ClientId.is(task.parentId)) {
            requeue.add(id);
            continue;
        }
        const parent = taskForId(state, task.parentId);
        const idx = parent.subtaskIds.indexOf(id);
        const afterId = idx === 0
            ? null
            : parent.subtaskIds[idx - 1];
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
    if (requeue.size > 0) inTheFuture(TaskActions.FLUSH_RENAMES);
    return state;
};

const mapTaskLO = (state, id, work) =>
    dotProp.set(state, [
        "byId",
        id,
    ], lo => {
        // dotProp will give us an anonymous object literal on a missing key...
        if (!(lo instanceof LoadObject)) {
            lo = LoadObject.empty();
        }
        return work(lo);
    });

const mapTask = (state, id, work) =>
    mapTaskLO(state, id, lo => lo.map(work));

const renameTask = (state, id, name) =>
    mapTaskLO(state, id, lo => {
        if (lo.isDone()) {
            lo = ClientId.is(id)
                ? lo.creating()
                : lo.updating();
        }
        tasksToRename.add(id);
        inTheFuture(TaskActions.FLUSH_RENAMES);
        return lo.map(t => ({
            ...t,
            name,
        }));
    });

const assignToBucket = (state, id, bucketId) => {
    if (ClientId.is(id)) return state;
    PlanApi.assignBucket(state.activeListId, id, bucketId);
    return mapTask(state, id, t => ({
        ...t,
        bucketId,
    }));
};

const focusTask = (state, id) => {
    taskForId(state, id);
    if (state.activeTaskId === id) return state;
    return {
        ...state,
        activeTaskId: id,
        selectedTaskIds: null,
    };
};

const getNeighborId = (state, id, delta = 1, crossGenerations=false, _searching=false) => {
    invariant(
        delta === 1 || delta === -1,
        "Deltas must be either 1 or -1",
    );
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
        if (crossGenerations || _searching) return getNeighborId(state, t.parentId, delta, false, true);
        // can't move
        return null;
    } else {
        // to prev sibling's last self-or-descendant
        if (idx > 0) return crossGenerations
            ? lastDescendantIdOf(state, siblingIds[idx - 1])
            : siblingIds[idx - 1];
        // to parent (null or not)
        if (crossGenerations && t.parentId !== state.activeListId) return t.parentId;
        return null;
    }
};

const lastDescendantIdOf = (state, id) => {
    while (id != null) {
        const desc = taskForId(state, id);
        if (!isExpanded(desc)) return desc.id;
        id = desc.subtaskIds[desc.subtaskIds.length - 1];
    }
    return null;
};

const focusDelta = (state, id, delta) => {
    if (delta === 0) return state;
    const sid = getNeighborId(state, id, delta, true);
    if (sid == null) return state;
    return focusTask(state, sid);
};

const selectTo = (state, id) => {
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

const selectDelta = (state, id, delta) => {
    const next = getNeighborId(state, id, delta, false);
    if (next == null) return state; // there's no neighbor
    if (state.selectedTaskIds == null) {
        // starting to select
        return {
            ...focusTask(state, next),
            selectedTaskIds: [id]
        };
    }
    const idx = state.selectedTaskIds.indexOf(next);
    if (idx >= 0) {
        // contract selection
        return {
            ...focusTask(state, next),
            selectedTaskIds: state.selectedTaskIds.length === 0
                ? null
                : state.selectedTaskIds.slice(0, idx)
        };
    } else {
        // expand selection
        return {
            ...focusTask(state, next),
            selectedTaskIds: state.selectedTaskIds.concat(id)
        };
    }
};

let statusUpdatesToFlush = new Map();

const unqueueTaskId = id => {
    tasksToRename.delete(id);
    statusUpdatesToFlush.delete(id);
};

const doTaskDelete = (state, id) => {
    unqueueTaskId(id);
    PlanApi.deleteItem(state.activeListId, id);
    return state;
};

const setTaskStatus = (state, id, status) => {
    if (willStatusDelete(status)) {
        unqueueTaskId(id);
    }
    PlanApi.updateItemStatus(state.activeListId, {
        id,
        status,
    });
    return state;
};

const flushStatusUpdates = state => {
    if (statusUpdatesToFlush.size === 0) return state;
    const [ id, status ] = statusUpdatesToFlush.entries().next().value; // the next value of the iterator, not the value of the entry!
    state = setTaskStatus(state, id, status);
    statusUpdatesToFlush.delete(id);
    if (statusUpdatesToFlush.size > 0) {
        inTheFuture(TaskActions.FLUSH_STATUS_UPDATES, 1);
    }
    return state;
};

const queueDelete = (state, id) => {
    if (!isKnown(state, id)) return state; // already gone...
    return queueStatusUpdate(state, id, TaskStatus.DELETED);
};

function isEmpty(taskOrString) {
    if (taskOrString == null) return true;
    const str = typeof taskOrString === "string"
        ? taskOrString
        : taskOrString.name;
    return str == null || str.trim() === "";
}

const queueStatusUpdate = (state, id, status) => {
    let lo = loForId(state, id);
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
        nextLO = lo.map(t => {
            t = {
                ...t,
            };
            delete t._next_status;
            return t;
        }).done();
    } else {
        statusUpdatesToFlush.set(id, status);
        inTheFuture(TaskActions.FLUSH_STATUS_UPDATES, 4);
        nextLO = lo.map(t => ({
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
        state.selectedTaskIds = state.selectedTaskIds
            .filter(it => it !== id);
    }
    return state;
};

const cancelStatusUpdate = (state, id) => {
    if (!statusUpdatesToFlush.has(id)) return state;
    statusUpdatesToFlush.delete(id);
    return mapTaskLO(state, id, lo => lo.map(t => {
        t = {...t};
        delete t._next_status;
        return t;
    }).done());
};

const taskDeleted = (state, id) => {
    unqueueTaskId(id);
    if (!isKnown(state, id)) return state;
    const t = taskForId(state, id);
    let p = taskForId(state, t.parentId);
    const idx = p.subtaskIds.indexOf(id);
    p = {
        ...p,
        subtaskIds: p.subtaskIds.slice(0, idx)
            .concat(p.subtaskIds.slice(idx + 1)),
    };
    const byId = {...state.byId};
    byId[p.id] = byId[p.id].setValue(p);
    const kill = id => {
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
const getOrderedBlock = state => {
    const block = [state.activeTaskId];
    if (state.selectedTaskIds != null) {
        block.push(...state.selectedTaskIds);
    }
    return block
        .map(id =>
            taskForId(state, id))
        .map(t =>
            [t, taskForId(state, t.parentId)])
        .map(([t, p]) =>
            [t, p, p.subtaskIds.indexOf(t.id)])
        .sort((a, b) => a[2] - b[2]);
};

const moveDelta = (state, delta) => {
    const upward = delta < 1;
    const block = getOrderedBlock(state);
    // eslint-disable-next-line no-unused-vars
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

const subtaskIdBefore = (state, parentId, before) => {
    const p = taskForId(state, parentId);
    if (!p.subtaskIds || p.subtaskIds.length === 0) return null;
    const idx = p.subtaskIds.indexOf(before);
    if (idx < 0) return p.subtaskIds[p.subtaskIds.length - 1];
    if (idx === 0) return null;
    return p.subtaskIds[idx - 1];
};

const moveSubtree = (state, action) => {
    let blockIds = getOrderedBlock(state)
        .map(([t]) => t.id);
    const afterId = action.hasOwnProperty("before")
        ? subtaskIdBefore(state, action.parentId, action.before)
        : action.after == null ? null : action.after;
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

const mutateTree = (state, spec) => {
    /*
    Spec is {ids, parentId, afterId}
     */
    // ensure no client IDs
    if (spec.ids.some(id => ClientId.is(id))) return state;
    if (ClientId.is(spec.parentId)) return state;
    if (ClientId.is(spec.afterId)) return state;
    // ensure we're not going to create a cycle
    for (let id = spec.parentId; id; id = taskForId(state, id).parentId) {
        if (spec.ids.includes(id)) return state;
    }
    // ensure we're not positioning something based on itself
    if (spec.ids.some(id => id === spec.afterId)) return state;
    PlanApi.mutateTree(state.activeListId, spec);
    // do it now so the UI updates; the future delta will be a race-y no-op
    return treeMutated(state, spec);
};

const treeMutated = (state, spec) => {
    // Woo! GO GO GO!
    const byId = {...state.byId};
    spec.ids.reduce((afterId, id) => {
        const lo = byId[id];
        // remove the task from its old parent
        const oldPid = byId[id].getValueEnforcing().parentId;
        byId[oldPid] = byId[oldPid].map(t => {
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
        byId[id] = lo.map(t => ({
            ...t,
            parentId: spec.parentId,
        }));
        // add the task to its new parent
        byId[spec.parentId] = byId[spec.parentId].map(t => {
            let subtaskIds = t.subtaskIds;
            if (subtaskIds) {
                const afterIdx = afterId == null
                    ? 0
                    : subtaskIds.indexOf(afterId) + 1;
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

const nestTask = state => {
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
        afterId: np.subtaskIds && np.subtaskIds.length
            ? np.subtaskIds[np.subtaskIds.length - 1]
            : null,
    });
    return setExpansion(state, np.id, true);
};

// if expanded is null, it means "toggle it"
const setExpansion = (state, id, expanded=null) =>
    dotProp.set(state, ["byId", id], lo => lo.map(t => ({
        ...t,
        _expanded: expanded == null ? !t._expanded : expanded,
    })));

const unnestTask = state => {
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

const toggleExpanded = (state, id) => {
    // if toggling a non-parent, that means "collapse my parent"
    const t = taskForId(state, id);
    if (!isParent(t)) {
        if (t.parentId === state.activeListId) {
            // we don't do the list
            return state;
        }
        id = t.parentId;
        state = focusTask(state, id);
    }
    return setExpansion(state, id);
};

const forceExpansionBuilder = expanded => {
    const work = (state, id) => {
        const lo = loForId(state, id);
        if (!lo.hasValue()) return state;
        const t = lo.getValueEnforcing();
        if (!isParent(t)) return state;
        state = setExpansion(state, t.id, expanded);
        return t.subtaskIds.reduce(work, state);
    };
    return state => {
        if (state.activeListId == null) return state;
        return work(state, state.activeListId);
    };
};

const expandAll = forceExpansionBuilder(true);
const collapseAll = forceExpansionBuilder(false);

const taskLoaded = (state, task) => {
    if (task.buckets) {
        task = {
            ...task,
            buckets: task.buckets
                .map(deserializeBucket)
                .sort(bucketComparator),
        };
    }
    let lo = state.byId[task.id] || LoadObject.empty();
    if (lo.hasValue()) {
        lo = lo.map(t => {
            const subtaskIds = task.subtaskIds
                ? task.subtaskIds.slice()
                : [];
            t.subtaskIds && t.subtaskIds.forEach((id, idx) => {
                if (!ClientId.is(id)) return;
                if (idx < subtaskIds.length) {
                    subtaskIds.splice(idx,0, id);
                } else {
                    subtaskIds.push(id);
                }
            });
            t = {
                ...t,
                ...task,
                name: task.id === state.activeTaskId
                    ? t.name
                    : task.name,
                subtaskIds: subtaskIds.length
                    ? subtaskIds
                    : null,
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

const taskLoading = (state, id) => {
    return dotProp.set(
        state,
        ["byId", id],
        lo => lo instanceof LoadObject
            ? lo.loading()
            : LoadObject.loading(),
    );
};

const loadLists = state => {
    TaskApi.loadLists();
    return {
        ...state,
        topLevelIds: state.topLevelIds.mapLO(lo => lo.loading()),
    };
};

const tasksLoaded = (state, tasks) =>
    tasks.reduce((s, t) =>
        taskLoaded(s, t), state);

function selectDefaultList(state) {
    const lids = state.topLevelIds.getLoadObject().getValueEnforcing();
    if (lids.length > 0) {
        // see if there's a preferred active list
        let alid = PreferencesStore.getActiveTaskList();
        if (lids.find(id => id === alid) == null) {
            // auto-select the first one
            alid = lids[0];
        }
        state = selectList(state, alid);
    }
    return state;
}

const listsLoaded = (state, lists) => {
    state = {
        ...tasksLoaded(state, lists),
        topLevelIds: state.topLevelIds.setLoadObject(
            LoadObject.withValue(lists.map(t => t.id))),
    };
    state = selectDefaultList(state);
    return state;
};

const mapPlanBuckets = (state, planId, work) =>
    dotProp.set(state, [
        "byId",
        planId,
    ], lo => lo.map(t => ({
        ...t,
        buckets: work(t.buckets || []),
    })));

const deserializeBucket = b => b.date
    ? { ...b, date: parseLocalDate(b.date) }
    : b;

const serializeBucket = b => b.date
    ? { ...b, date: formatLocalDate(b.date) }
    : b;

const saveBucket = (state, bucket) => {
    const body = serializeBucket(bucket);
    ClientId.is(bucket.id)
        ? PlanApi.createBucket(state.activeListId, body)
        : PlanApi.updateBucket(state.activeListId, bucket.id, body);
};

const doInteractiveStatusChange = (state, id, status) => {
    if (willStatusDelete(status) && id === state.activeTaskId) {
        state = focusDelta(state, id, 1);
    }
    return queueStatusUpdate(state, id, status);
};

class TaskStore extends ReduceStore {

    getInitialState() {
        return {
            activeListId: null, // ID
            listDetailVisible: false, // boolean
            activeTaskId: null, // ID
            selectedTaskIds: null, // Array<ID>
            topLevelIds: new LoadObjectState(
                () => Dispatcher.dispatch({
                    type: TaskActions.LOAD_LISTS,
                })), // LoadObjectState<Array<ID>>
            byId: {}, // Map<ID, LoadObject<Task>>
        };
    }

    reduce(state, action) {
        switch (action.type) {
            case TaskActions.CREATE_LIST: {
                return createList(state, action.name);
            }

            case TaskActions.DUPLICATE_LIST: {
                return createList(state, action.name, action.fromId);
            }

            case TaskActions.LIST_CREATED: {
                return listCreated(
                    state,
                    action.clientId,
                    action.id,
                    action.data,
                );
            }

            case TaskActions.LIST_DETAIL_VISIBILITY: {
                if (state.listDetailVisible === action.visible) return state;
                return {
                    ...state,
                    listDetailVisible: action.visible,
                };
            }

            case TaskActions.DELETE_LIST: {
                TaskApi.deleteList(action.id);
                let next = dotProp.set(state, [
                    "byId",
                    action.id,
                ], lo => lo.deleting());
                if (next.activeListId === action.id) {
                    const lo = next.topLevelIds.getLoadObject();
                    next.activeListId = lo.hasValue()
                        ? lo.getValueEnforcing().find(id =>
                            id !== action.id)
                        : null;
                    next.listDetailVisible = false;
                    next.activeTaskId = null;
                    next.selectedTaskIds = null;
                    next = selectDefaultList(next);
                }
                return next;
            }

            case TaskActions.LIST_DELETED: {
                return selectDefaultList({
                    ...dotProp.delete(state, [
                        "byId",
                        action.id,
                    ]),
                    topLevelIds: state.topLevelIds.map(ids =>
                        ids.filter(id => id !== action.id)),
                });
            }

            case TaskActions.LOAD_LISTS:
                return loadLists(state);
            case TaskActions.LISTS_LOADED:
                return listsLoaded(state, action.data);
            case TaskActions.SELECT_LIST:
                return selectList(state, action.id);
            case TaskActions.RENAME_LIST:
                return renameTask(state, action.id, action.name);

            case TaskActions.SET_LIST_GRANT: {
                TaskApi.setListGrant(action.id, action.userId, action.level);
                return dotProp.set(state, [
                    "byId",
                    action.id,
                ], lo => lo.map(l => dotProp.set(l, ["acl",
                    "grants",
                    action.userId,
                ], action.level)).updating());
            }

            case TaskActions.CLEAR_LIST_GRANT: {
                TaskApi.clearListGrant(action.id, action.userId);
                return dotProp.set(state, [
                    "byId",
                    action.id,
                ], lo => lo.map(l => dotProp.delete(l, ["acl",
                    "grants",
                    action.userId,
                ])).deleting());
            }

            case TaskActions.LIST_GRANT_SET:
            case TaskActions.LIST_GRANT_CLEARED: {
                return dotProp.set(state, [
                    "byId",
                    action.id,
                ], lo => lo.done());
            }

            case TaskActions.LIST_DATA_BOOTSTRAPPED:
            case TaskActions.LIST_DELTAS: {
                return tasksLoaded(state, action.data);
            }

            case TaskActions.TREE_CREATE: {
                return tasksCreated(state, action.data, action.newIds);
            }

            case TaskActions.RENAME_TASK:
                return renameTask(state, action.id, action.name);

            case TaskActions.UPDATED: {
                return taskLoaded(state, action.data);
            }

            case TaskActions.DELETED: {
                return taskDeleted(state, action.id);
            }

            case TaskActions.FOCUS: {
                state = focusTask(state, action.id);
                return flushTasksToRename(state);
            }

            case ShoppingActions.FOCUS: {
                return flushTasksToRename(state);
            }

            case TaskActions.FOCUS_NEXT:
                state = focusDelta(state, state.activeTaskId, 1);
                return flushTasksToRename(state);
            case TaskActions.FOCUS_PREVIOUS:
                state = focusDelta(state, state.activeTaskId, -1);
                return flushTasksToRename(state);

            case TaskActions.CREATE_TASK_AFTER:
            case ShoppingActions.CREATE_ITEM_AFTER: {
                state = createTaskAfter(state, action.id);
                return flushTasksToRename(state);
            }

            case TaskActions.CREATE_TASK_BEFORE:
            case ShoppingActions.CREATE_ITEM_BEFORE: {
                state = createTaskBefore(state, action.id);
                return flushTasksToRename(state);
            }

            case TaskActions.CREATE_TASK_AT_END:
            case ShoppingActions.CREATE_ITEM_AT_END: {
                state = addTask(state, state.activeListId, "");
                return state;
            }

            case TaskActions.SEND_TO_PLAN: {
                return addTaskAndFlush(state, action.planId, action.name);
            }

            case PantryItemActions.SEND_TO_PLAN: {
                let name = action.name.trim();
                if (name.indexOf(" ") > 0) {
                    name = `"${name}"`;
                }
                return addTaskAndFlush(state, action.planId, name);
            }

            case TaskActions.DELETE_TASK_FORWARD:
            case ShoppingActions.DELETE_ITEM_FORWARD: {
                state = focusDelta(state, action.id, 1);
                return queueDelete(state, action.id);
            }

            case TaskActions.DELETE_TASK_BACKWARDS:
            case ShoppingActions.DELETE_ITEM_BACKWARDS: {
                state = focusDelta(state, action.id, -1);
                return queueDelete(state, action.id);
            }

            case TaskActions.SET_STATUS: {
                return doInteractiveStatusChange(state, action.id, action.status);
            }

            case TaskActions.BULK_SET_STATUS: {
                return action.ids.reduce((s, id) =>
                    doInteractiveStatusChange(s, id, action.status), state);
            }

            case ShoppingActions.SET_INGREDIENT_STATUS: {
                return action.itemIds.reduce((s, id) =>
                    queueStatusUpdate(s, id, action.status), state);
            }

            case TaskActions.DELETE_SELECTED: {
                const tasks = getOrderedBlock(state)
                    .map(([t]) => t);
                state = tasks
                    .reduce((s, t) => queueDelete(s, t.id), state);
                return focusDelta(state, tasks[0].id, -1);
            }

            case TaskActions.UNDO_SET_STATUS: {
                return cancelStatusUpdate(state, action.id);
            }

            case ShoppingActions.UNDO_SET_INGREDIENT_STATUS: {
                return action.itemIds.reduce((s, id) =>
                    cancelStatusUpdate(s, id), state);
            }

            case TaskActions.SELECT_NEXT:
                return selectDelta(state, state.activeTaskId, 1);
            case TaskActions.SELECT_PREVIOUS:
                return selectDelta(state, state.activeTaskId, -1);
            case TaskActions.SELECT_TO:
                return selectTo(state, action.id);

            case TaskActions.MOVE_NEXT: {
                return moveDelta(state, 1);
            }

            case TaskActions.MOVE_PREVIOUS: {
                return moveDelta(state, -1);
            }

            case TaskActions.NEST: {
                return nestTask(state);
            }

            case TaskActions.UNNEST: {
                return unnestTask(state);
            }

            case TaskActions.MOVE_SUBTREE: {
                return moveSubtree(state, action);
            }

            case TaskActions.TOGGLE_EXPANDED: {
                return toggleExpanded(state, action.id);
            }

            case TaskActions.EXPAND_ALL: {
                return expandAll(state);
            }

            case TaskActions.COLLAPSE_ALL: {
                return collapseAll(state);
            }

            case TaskActions.MULTI_LINE_PASTE: {
                const lines = action.text.split("\n")
                    .map(l => l.trim())
                    .filter(l => l.length > 0);
                const active = taskForId(state, state.activeTaskId);
                if (active.name == null || active.name.trim().length === 0) {
                    state = renameTask(state, active.id, lines.shift());
                }
                state = lines.reduce((s, l) => {
                    s = createTaskAfter(s, s.activeTaskId);
                    s = renameTask(s, s.activeTaskId, l);
                    return s;
                }, state);
                return flushTasksToRename(state);
            }

            case TaskActions.CREATE_BUCKET: {
                return mapPlanBuckets(state, action.planId, bs =>
                    [{id: ClientId.next()}].concat(bs));
            }

            case TaskActions.GENERATE_ONE_WEEKS_BUCKETS: {
                return mapPlanBuckets(state, action.planId, bs => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const maxDate = bs.reduce((max, b) =>
                        b.date != null && b.date > max
                            ? b.date
                            : max,
                        yesterday);
                    const newOnes = [];
                    for (let i = 1; i <= 7; i++) {
                        const date = new Date(maxDate.valueOf());
                        date.setDate(date.getDate() + i);
                        const b = {
                            id: ClientId.next(),
                            date,
                        };
                        saveBucket(state, b);
                        newOnes.push(b);
                    }
                    return bs.concat(newOnes);
                });
            }

            case TaskActions.BUCKET_CREATED: {
                return mapPlanBuckets(state, action.planId, bs =>
                    bs.filter(b => b.id !== action.oldId)
                        .concat(deserializeBucket(action.data))
                        .sort(bucketComparator));
            }

            case TaskActions.DELETE_BUCKET: {
                return mapPlanBuckets(state, action.planId, bs => {
                    const idx = bs.findIndex(b => b.id === action.id);
                    if (idx >= 0 && !ClientId.is(action.id)) {
                        PlanApi.deleteBucket(state.activeListId, action.id);
                    }
                    return removeAtIndex(bs, idx);
                });
            }

            case TaskActions.BUCKET_DELETED: {
                return mapPlanBuckets(state, action.planId, bs =>
                    bs.filter(b => b.id !== action.id));
            }

            case TaskActions.RENAME_BUCKET: {
                return mapPlanBuckets(state, action.planId, bs =>
                    bs.map(b => {
                        if (b.id !== action.id) return b;
                        b = {...b, name: action.name};
                        saveBucket(state, b);
                        return b;
                    }).sort(bucketComparator));

            }

            case TaskActions.SET_BUCKET_DATE: {
                return mapPlanBuckets(state, action.planId, bs =>
                    bs.map(b => {
                        if (b.id !== action.id) return b;
                        b = {...b, date: action.date};
                        saveBucket(state, b);
                        return b;
                    }).sort(bucketComparator));
            }

            case TaskActions.BUCKET_UPDATED: {
                return mapPlanBuckets(state, action.planId, bs =>
                    bs.map(b => {
                        if (b.id !== action.data.id) return b;
                        return deserializeBucket(action.data);
                    }).sort(bucketComparator));
            }

            case TaskActions.ASSIGN_ITEM_TO_BUCKET: {
                return assignToBucket(state, action.id, action.bucketId);
            }

            case TaskActions.SORT_BY_BUCKET: {
                let plan = taskForId(state, state.activeListId);
                if (!plan.buckets) return state;
                const bucketIdOrder = plan.buckets.reduce((index, b, i) => ({
                    ...index,
                    [b.id]: i,
                }), {});
                const desiredIds = plan.subtaskIds
                    .map(id => taskForId(state, id))
                    .map(t => [t.id, t.bucketId ? bucketIdOrder[t.bucketId] : -1])
                    .sort((pa, pb) => pa[1] - pb[1])
                    .map(pair => pair[0]);
                for (let i = 0, l = desiredIds.length; i < l; i++) {
                    if (plan.subtaskIds[i] !== desiredIds[i]) {
                        PlanApi.reorderSubitems(plan.id, desiredIds);
                        // update immediately; the coming delta will be a no-op
                        return mapTask(state, plan.id, v => ({
                            ...v,
                            subtaskIds: desiredIds,
                        }));
                    }
                }
                return state; // no-op
            }

            case TaskActions.FLUSH_RENAMES:
                return flushTasksToRename(state);
            case TaskActions.FLUSH_STATUS_UPDATES:
                return flushStatusUpdates(state);

            default:
                return state;
        }
    }

    getListsLO() {
        return this.getState()
            .topLevelIds
            .getLoadObject();
    }

    getLists() {
        const s = this.getState();
        return this.getListsLO().map(ids => losForIds(s, ids)
            .filter(lo => lo.isDone())
            .map(lo => lo.getValueEnforcing()));
    }

    getSubtaskLOs(id) {
        const s = this.getState();
        const t = taskForId(s, id);
        return losForIds(s, t.subtaskIds);
    }

    getComponentLOs(id) {
        const s = this.getState();
        const t = taskForId(s, id);
        return losForIds(s, t.componentIds);
    }

    getNonDescendantComponents(id) {
        const state = this.getState();
        const t = taskForId(state, id);
        if (!t.componentIds) return [];
        const queue = t.componentIds.slice();
        const result = [];
        while (queue.length) {
            const comp = taskForId(state, queue.shift());
            // walk upward and see if it's within the tree...
            let curr = comp;
            let descendant = false;
            while (curr.parentId != null) {
                if (curr.parentId === id) {
                    descendant = true;
                    break;
                }
                curr = taskForId(state, curr.parentId);
            }
            // process the component...
            if (descendant) {
                comp.componentIds && queue.push(...comp.componentIds);
            } else {
                result.push(comp);
            }
        }
        return result;
    }

    getActiveListLO() {
        const lo = this.getListsLO();
        if (!lo.hasValue()) return lo;
        const s = this.getState();
        return s.activeListId == null
            ? LoadObject.empty()
            : loForId(s, s.activeListId);
    }

    getActiveTask() {
        const s = this.getState();
        if (s.activeTaskId == null) return null;
        const lo = loForId(s, s.activeTaskId);
        return lo.hasValue() ? lo.getValueEnforcing() : null;
    }

    getTaskLO(id) {
        if (id == null) throw new Error("No task has the null ID");
        const s = this.getState();
        return isKnown(s, id) ? loForId(s, id) : LoadObject.empty();
    }

    getSelectedTasks() {
        const s = this.getState();
        return s.selectedTaskIds == null
            ? null
            : tasksForIds(s, s.selectedTaskIds);
    }

    getItemsInBucket(planId, bucketId) {
        /* todo: This is TERRIBLE form. Bucket membership should be tracked like
            any other data, not scanned for across the entire plan.
         */
        const byId = this.getState().byId;
        const items = [];
        const stack = [planId];
        while (stack.length) {
            const lo = byId[stack.pop()];
            if (!lo || !lo.hasValue()) continue;
            const it = lo.getValueEnforcing();
            if (it.bucketId === bucketId) {
                items.push(it);
                continue;
            }
            if (it.subtaskIds) stack.push(...it.subtaskIds);
        }
        return items;
    }

    isListDetailVisible() {
        return this.getState().listDetailVisible;
    }

    isMultiTaskSelection() {
        const s = this.getState();
        return s.activeTaskId != null && s.selectedTaskIds != null;
    }

    getSelectionAsTextBlock() {
        const s = this.getState();
        return tasksForIds(
            s,
            taskForId(s, taskForId(s, s.activeTaskId).parentId)
                .subtaskIds
                .filter(id =>
                    id === s.activeTaskId || s.selectedTaskIds.indexOf(id) >= 0),
        )
            .map(t => t.name)
            .join("\n");
    }
}

export const bucketType = PropTypes.exact({
    id: clientOrDatabaseIdType.isRequired,
    name: PropTypes.string,
    date: PropTypes.instanceOf(Date),
});

TaskStore.stateTypes = {
    activeListId: clientOrDatabaseIdType,
    listDetailVisible: PropTypes.bool.isRequired,
    activeTaskId: clientOrDatabaseIdType,
    selectedTaskIds: PropTypes.arrayOf(clientOrDatabaseIdType),
    topLevelIds: loadObjectStateOf(
        PropTypes.arrayOf(clientOrDatabaseIdType)
    ),
    byId: PropTypes.objectOf(
        loadObjectOf(PropTypes.exact({
            //  core
            id: clientOrDatabaseIdType.isRequired,
            name: PropTypes.string.isRequired,
            notes: PropTypes.string,
            status: PropTypes.string.isRequired,
            parentId: PropTypes.number,
            subtaskIds: PropTypes.arrayOf(clientOrDatabaseIdType),
            aggregateId: PropTypes.number,
            componentIds: PropTypes.arrayOf(PropTypes.number),
            bucketId: PropTypes.number,
            // lists
            acl: PropTypes.exact({
                ownerId: PropTypes.number.isRequired,
                grants: PropTypes.objectOf(
                    PropTypes.oneOf(Object.values(AccessLevel))
                ),
            }),
            buckets: PropTypes.arrayOf(bucketType),
            // item
            quantity: PropTypes.number,
            uomId: PropTypes.number,
            units: PropTypes.string,
            ingredientId: PropTypes.number,
            preparation: PropTypes.string,
            // client-side
            _expanded: PropTypes.bool,
            _next_status: PropTypes.string,
        }))
    ).isRequired,
};

export default typedStore(new TaskStore(Dispatcher));
