import dotProp from "dot-prop-immutable";
import { ReduceStore } from "flux/utils";
import invariant from "invariant";
import PropTypes from "prop-types";
import ClientId, { clientOrDatabaseIdType } from "../util/ClientId";
import { humanStringComparator } from "../util/comparators";
import hotLoadObject from "../util/hotLoadObject";
import inTheFuture from "../util/inTheFuture";
import LoadObject from "../util/LoadObject";
import loadObjectOf from "../util/loadObjectOf";
import typedStore from "../util/typedStore";
import {
    userActedWithin,
    userAction,
} from "../util/userAction";
import AccessLevel from "./AccessLevel";
import Dispatcher from "./dispatcher";
import PreferencesStore from "./PreferencesStore";
import RecipeActions from "./RecipeActions";
import RouteStore from "./RouteStore";
import ShoppingActions from "./ShoppingActions";
import TaskActions from "./TaskActions";
import TaskApi from "./TaskApi";
import {
    isExpanded,
    isParent,
} from "./tasks";
import TaskStatus, { willStatusDelete } from "./TaskStatus";
import TemporalActions from "./TemporalActions";
import UserStore from "./UserStore";
import WindowActions from "./WindowActions";
import WindowStore from "./WindowStore";

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

const createList = (state, name) => {
    const task = _newTask(name);
    task.acl = {
        ownerId: UserStore.getProfileLO().getValueEnforcing().id,
    };
    TaskApi.createList(name, task.id);
    return {
        ...state,
        activeListId: task.id,
        activeTaskId: null,
        topLevelIds: state.topLevelIds.map(ids => ids.concat(task.id)),
        byId: {
            ...state.byId,
            [task.id]: LoadObject.withValue(task).creating(),
        },
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
        if (typeof ids === "string") return ids;
        if (typeof ids === "number") return ids;
        throw new Error("Unsupported value passed to replaceId: " + ids);
    };
    return idFixer;
};

const receiveTaskSave = (lo, task) =>
    // Despite possibly thinking we'd want to save the name, we don't. If the
    // user has made further changes while the save (creation or rename) was in
    // flight, we don't want to lose those. It'll save again shortly.
    lo.done().map(t => ({
        ...t,
        ...task,
        name: t.name,
    }));

const taskCreated = (state, clientId, id, task) => {
    const idFixer = idFixerFactory(clientId, id);
    const byId = {
        ...state.byId,
        [id]: receiveTaskSave(state.byId[clientId], task),
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

const listCreated = (state, clientId, id, list) => {
    const idFixer = idFixerFactory(clientId, id);
    const byId = {
        ...state.byId,
        [id]: LoadObject.withValue(list),
    };
    delete byId[clientId];
    return addTask({
        ...state,
        activeListId: idFixer(state.activeListId),
        topLevelIds: idFixer(state.topLevelIds),
        byId,
    }, id, "");
};

const selectList = (state, id) => {
    if (state.activeListId === id) return state;
    // only valid ids, please
    const list = taskForId(state, id);
    invariant(
        state.topLevelIds.getValueEnforcing().some(it => it === id),
        `Task '${id}' is not a list.`,
    );
    state = {
        ...state,
        activeListId: id,
        listDetailVisible: false,
    };
    if (list.subtaskIds && list.subtaskIds.length) {
        state.activeTaskId = list.subtaskIds[0];
    } else {
        state = addTask(state, id, "");
    }
    return loadSubtasks(state, id);
};

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
    const plo = loForId(state, parentId);
    return {
        ...state,
        activeTaskId: task.id,
        byId: {
            ...state.byId,
            [parentId]: plo.map(p => ({
                ...p,
                subtaskIds: spliceIds(p.subtaskIds, task.id, after),
            })),
            [task.id]: LoadObject.withValue({
                ...task,
                parentId,
            }),
        },
    };
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
            TaskApi.renameTask(id, task.name);
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
        TaskApi.createTask(task.name, task.parentId, id, afterId);
    }
    tasksToRename = requeue;
    if (requeue.size > 0) inTheFuture(TaskActions.FLUSH_RENAMES);
    return state;
};

const renameTask = (state, id, name) => {
    let lo = loForId(state, id);
    const task = lo.getValueEnforcing();
    if (task.name === name) return state;
    tasksToRename.add(id);
    inTheFuture(TaskActions.FLUSH_RENAMES);
    if (lo.isDone()) {
        lo = ClientId.is(id)
            ? lo.creating()
            : lo.updating();
    }
    return {
        ...state,
        byId: {
            ...state.byId,
            [id]: lo.map(t => ({
                ...t,
                name,
            })),
        }
    };
};

const focusTask = (state, id) => {
    taskForId(state, id);
    if (state.activeTaskId === id) return state;
    if (state.activeTaskId != null) {
        const prev = taskForId(state, state.activeTaskId);
        if (prev.name && prev.name.trim() === "") {
            state = queueDelete(state, state.activeTaskId);
        }
    }
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
    parentsToReset.delete(id);
    tasksToRename.delete(id);
    statusUpdatesToFlush.delete(id);
};

const doTaskDelete = id => {
    unqueueTaskId(id);
    TaskApi.deleteTask(id);
};

const setTaskStatus = (id, status) => {
    if (willStatusDelete(status)) {
        unqueueTaskId(id);
    }
    TaskApi.setStatus(id, status);
};

const flushStatusUpdates = state => {
    if (statusUpdatesToFlush.size === 0) return state;
    for (const [id, status] of Array.from(statusUpdatesToFlush)) {
        setTaskStatus(id, status);
    }
    statusUpdatesToFlush.clear();
    return state;
};

const queueDelete = (state, id) =>
    queueStatusUpdate(state, id, TaskStatus.DELETED);

const queueStatusUpdate = (state, id, status) => {
    let lo = loForId(state, id);
    const t = lo.getValueEnforcing();
    invariant(
        t.parentId != null,
        "Can't change root-level task '%s' to %s",
        id,
        status,
    );
    if (t._next_status == null && t.status === status) return state;
    if (t._next_status === status) return state;
    const isDelete = willStatusDelete(status);
    let nextLO = lo.map(t => ({
        ...t,
        _next_status: status,
    }));
    if (isDelete) nextLO = nextLO.deleting();
    else nextLO = nextLO.updating();
    state = {
        ...state,
        activeTaskId: null,
        selectedTaskIds: null,
        byId: {
            ...state.byId,
            [id]: nextLO,
        },
    };

    if (ClientId.is(id)) {
        state = taskDeleted(state, id);
    } else if (t.name === "") {
        doTaskDelete(id);
    } else {
        statusUpdatesToFlush.set(id, status);
        inTheFuture(TaskActions.FLUSH_STATUS_UPDATES, 9);
    }
    if (isExpanded(t) && isDelete) {
        state = setExpansion(state, t.id, false);
    }
    return state;
};

const cancelStatusUpdate = (state, id) => {
    if (!statusUpdatesToFlush.has(id)) return state;
    statusUpdatesToFlush.delete(id);
    return {
        ...state,
        activeTaskId: id,
        byId: {
            ...state.byId,
            [id]: state.byId[id].map(t => {
                t = {...t};
                delete t._next_status;
                return t;
            }).done(),
        },
    };
};

const taskDeleted = (state, id) => {
    const t = taskForId(state, id);
    let p = taskForId(state, t.parentId);
    const idx = p.subtaskIds.indexOf(id);
    p = {
        ...p,
        subtaskIds: p.subtaskIds.slice(0, idx)
            .concat(p.subtaskIds.slice(idx + 1)),
    };
    state = {
        ...state,
        byId: {
            ...state.byId,
            [p.id]: LoadObject.withValue(p),
        },
    };
    if (p.id === state.activeListId && !isParent(p)) {
        // it was the last task on the list
        state = addTask(state, p.id, "", AT_END);
    }
    return state;
};

const statusUpdated = (state, id, status, data) => {
    if (willStatusDelete(status)) {
        return taskDeleted(state, id);
    } else {
        return taskUpdated(state, id, data);
    }
};

let parentsToReset = new Set();

const flushParentsToReset = state => {
    if (parentsToReset.size === 0) return state;
    const requeue = new Set();
    for (const id of parentsToReset) {
        if (! state.byId.hasOwnProperty(id)) continue;
        const p = taskForId(state, id);
        if (p.subtaskIds.some(ClientId.is)) {
            requeue.add(p.id);
        } else {
            TaskApi.resetSubtasks(p.id, p.subtaskIds);
        }
    }
    parentsToReset = requeue;
    if (requeue.size > 0) inTheFuture(TaskActions.FLUSH_REORDERS, 1);
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
    return moveSubtreeInternal(state, {
        ids: block.map(([t]) => t.id),
        parentId: p.id,
        afterId,
    });
};

const moveSubtreeInternal = (state, spec) => {
    /*
    Spec is {ids, parentId, afterId}
     */
    // ensure no client IDs
    if (spec.ids.some(id => ClientId.is(id))) return state;
    if (ClientId.is(spec.parentId)) return state;
    if (ClientId.is(spec.afterId)) return state;
    // ensure we're not going to create a cycle
    for (let id = spec.parentId; id; id = taskForId(state, id).parentId){
        if (spec.ids.includes(id)) return state;
    }
    // Woo! GO GO GO!
    const byId = {...state.byId};
    for (const id of spec.ids.reverse()) {
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
                const afterIdx = spec.afterId == null
                    ? 0
                    : subtaskIds.indexOf(spec.afterId) + 1;
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
    }
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
    state = moveSubtreeInternal(state, {
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
    return moveSubtreeInternal(state, {
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

const loadSubtasks = (state, id, background = false) => {
    TaskApi.loadSubtasks(id, background);
    if (background) return state;
    return dotProp.set(
        state,
        ["byId", id],
        lo => lo.updating());
};

const taskLoaded = (state, task, background=false) => {
    let lo = state.byId[task.id] || LoadObject.empty();
    if (lo.hasValue()) {
        lo = lo.map(t => ({ ...t, ...task }));
    } else {
        lo = lo.setValue(task);
    }
    state = dotProp.set(
        state,
        ["byId", task.id],
        lo.done());
    if (isParent(task)) {
        state = loadSubtasks(state, task.id, background);
        state = task.subtaskIds.reduce(taskLoading, state);
    }
    return state;
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

const taskUpdated = (state, id, task) => ({
    ...state,
    byId: {
        ...state.byId,
        [id]: receiveTaskSave(state.byId[id], task),
    },
});

const loadLists = state => {
    TaskApi.loadLists();
    return {
        ...state,
        topLevelIds: state.topLevelIds.loading(),
    };
};

const listsLoaded = (state, lists) => {
    state = {
        ...lists.reduce((s, t) =>
            taskLoaded(s, t), state),
        topLevelIds: LoadObject.withValue(lists.map(t => t.id)),
    };
    if (lists.length > 0) {
        // see if there's a preferred active list
        let alid = PreferencesStore.getActiveTaskList();
        if (lists.find(it => it.id === alid) == null) {
            // auto-select the first one
            alid = lists.sort(humanStringComparator)[0].id;
        }
        state = selectList(state, alid);
    }
    return state;
};

class TaskStore extends ReduceStore {

    getInitialState() {
        return {
            activeListId: null, // ID
            listDetailVisible: false, // boolean
            activeTaskId: null, // ID
            selectedTaskIds: null, // Array<ID>
            topLevelIds: LoadObject.empty(), // LoadObject<Array<ID>>
            byId: {}, // Map<ID, LoadObject<Task>>
        };
    }

    reduce(state, action) {
        switch (action.type) {
            case TaskActions.CREATE_LIST:
                userAction();
                return createList(state, action.name);
            case TaskActions.LIST_CREATED:
                return listCreated(
                    state,
                    action.clientId,
                    action.id,
                    action.data,
                );

            case TaskActions.LIST_DETAIL_VISIBILITY: {
                if (state.listDetailVisible === action.visible) return state;
                userAction();
                return {
                    ...state,
                    listDetailVisible: action.visible,
                };
            }

            case TaskActions.DELETE_LIST: {
                userAction();
                TaskApi.deleteList(action.id);
                const next = dotProp.set(state, [
                    "byId",
                    action.id,
                ], lo => lo.deleting());
                if (next.activeListId === action.id) {
                    next.activeListId = next.topLevelIds.hasValue()
                        ? next.topLevelIds.getValueEnforcing().find(id =>
                            id !== action.id)
                        : null;
                    next.listDetailVisible = false;
                    next.activeTaskId = null;
                    next.selectedTaskIds = null;
                }
                return next;
            }

            case TaskActions.LIST_DELETED: {
                return {
                    ...dotProp.delete(state, [
                        "byId",
                        action.id,
                    ]),
                    topLevelIds: state.topLevelIds.map(ids =>
                        ids.filter(id => id !== action.id)),
                };
            }

            case TaskActions.LOAD_LISTS:
                return loadLists(state);
            case TaskActions.LISTS_LOADED:
                return listsLoaded(state, action.data);
            case TaskActions.SELECT_LIST:
                userAction();
                return selectList(state, action.id);
            case TaskActions.RENAME_LIST:
                userAction();
                return renameTask(state, action.id, action.name);

            case TaskActions.SET_LIST_GRANT: {
                userAction();
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
                userAction();
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

            case TaskActions.SUBTASKS_LOADED: {
                if (action.background && userActedWithin(10 * 1000)) {
                    // they did something while in flight
                    return state;
                }
                return dotProp.set(
                    action.data.reduce((s, t) =>
                        taskLoaded(s, t, action.background), state),
                    ["byId", action.id],
                    lo => lo.map(task => ({
                        ...task,
                        subtaskIds: action.data.map(it => it.id),
                    })).done()
                );
            }

            case TaskActions.RENAME_TASK:
                userAction();
                return renameTask(state, action.id, action.name);

            case TaskActions.TASK_RENAMED: {
                return taskUpdated(state, action.id, action.data);
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
                userAction();
                return createTaskAfter(state, action.id);
            case TaskActions.CREATE_TASK_BEFORE:
                userAction();
                return createTaskBefore(state, action.id);
            case TaskActions.TASK_CREATED:
                state = taskCreated(
                    state,
                    action.clientId,
                    action.id,
                    action.data,
                );
                return state;

            case TaskActions.DELETE_TASK_FORWARD: {
                userAction();
                state = queueDelete(state, action.id);
                return focusDelta(state, action.id, 1);
            }

            case TaskActions.DELETE_TASK_BACKWARDS: {
                userAction();
                state = queueDelete(state, action.id);
                return focusDelta(state, action.id, -1);
            }

            case TaskActions.SET_STATUS: {
                userAction();
                state = queueStatusUpdate(state, action.id, action.status);
                if (action.status === TaskStatus.COMPLETED || action.status === TaskStatus.DELETED) {
                    state = focusDelta(state, action.id, 1);
                }
                return state;
            }

            case ShoppingActions.SET_INGREDIENT_STATUS: {
                userAction();
                return action.itemIds.reduce((s, id) =>
                    queueStatusUpdate(s, id, action.status), state);
            }

            case TaskActions.DELETE_SELECTED: {
                const tasks = getOrderedBlock(state)
                    .map(([t]) => t);
                state = tasks
                    .reduce((s, t) => queueDelete(s, t.id), state);
                return focusDelta(state, tasks[0].id, 1);
            }

            case TaskActions.UNDO_SET_STATUS: {
                userAction();
                return cancelStatusUpdate(state, action.id);
            }

            case ShoppingActions.UNDO_SET_INGREDIENT_STATUS: {
                userAction();
                return action.itemIds.reduce((s, id) =>
                    cancelStatusUpdate(s, id), state);
            }

            case TaskActions.STATUS_UPDATED: {
                return statusUpdated(state, action.id, action.status, action.data);
            }

            case TaskActions.TASK_DELETED: {
                return taskDeleted(state, action.id);
            }

            case TaskActions.SELECT_NEXT:
                userAction();
                return selectDelta(state, state.activeTaskId, 1);
            case TaskActions.SELECT_PREVIOUS:
                userAction();
                return selectDelta(state, state.activeTaskId, -1);
            case TaskActions.SELECT_TO:
                userAction();
                return selectTo(state, action.id);
            case TaskActions.MOVE_NEXT: // todo: recast as tree move
                userAction();
                return moveDelta(state, 1);
            case TaskActions.MOVE_PREVIOUS: // todo: recast as tree move
                userAction();
                return moveDelta(state, -1);

            case TaskActions.NEST: { // todo: recast as tree move
                userAction();
                return nestTask(state);
            }

            case TaskActions.UNNEST: { // todo: recast as tree move
                userAction();
                return unnestTask(state);
            }

            case TaskActions.TOGGLE_EXPANDED: {
                userAction();
                return toggleExpanded(state, action.id);
            }

            case TaskActions.EXPAND_ALL: {
                userAction();
                return expandAll(state);
            }

            case TaskActions.COLLAPSE_ALL: {
                userAction();
                return collapseAll(state);
            }

            case TaskActions.MULTI_LINE_PASTE: {
                userAction();
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

            case TaskActions.FLUSH_RENAMES:
                return flushTasksToRename(state);
            case TaskActions.FLUSH_REORDERS:
                return flushParentsToReset(state);
            case TaskActions.FLUSH_STATUS_UPDATES:
                return flushStatusUpdates(state);

            case RecipeActions.SENT_TO_PLAN: {
                TaskApi.loadSubtasks(action.planId, false);
                return state;
            }

            case TemporalActions.EVERY_15_SECONDS: {
                if (userActedWithin(1000 * 15)) return state;
                if (state.activeListId == null) return state;
                if (RouteStore.getMatch().path !== "/plan") return state;
                if (!WindowStore.isActive()) return state;
                return loadSubtasks(state, state.activeListId, true);
            }

            case WindowActions.VISIBILITY_CHANGE: {
                if (state.activeListId == null) return state;
                if (RouteStore.getMatch().path !== "/plan") return state;
                if (!WindowStore.isVisible()) return state;
                return loadSubtasks(state, state.activeListId, true);
            }

            default:
                return state;
        }
    }

    getListsLO() {
        return hotLoadObject(
            () => this.getState().topLevelIds,
            () => Dispatcher.dispatch({
                type: TaskActions.LOAD_LISTS,
            }),
        );
    }

    getLists() {
        const s = this.getState();
        return this.getListsLO().map(ids => losForIds(s, ids)
            .filter(lo => lo.isDone())
            .map(lo => lo.getValueEnforcing()));
    }

    getSubtaskLOs(id) {
        const s = this.getState();
        const p = taskForId(s, id);
        return losForIds(s, p.subtaskIds);
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

    getSelectedTasks() {
        const s = this.getState();
        return s.selectedTaskIds == null
            ? null
            : tasksForIds(s, s.selectedTaskIds);
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

TaskStore.stateTypes = {
    activeListId: clientOrDatabaseIdType,
    listDetailVisible: PropTypes.bool.isRequired,
    activeTaskId: clientOrDatabaseIdType,
    selectedTaskIds: PropTypes.arrayOf(clientOrDatabaseIdType),
    topLevelIds: loadObjectOf(
        PropTypes.arrayOf(clientOrDatabaseIdType)
    ),
    byId: PropTypes.objectOf(
        loadObjectOf(PropTypes.exact({
            //  core
            id: clientOrDatabaseIdType.isRequired,
            name: PropTypes.string.isRequired,
            status: PropTypes.string.isRequired,
            parentId: PropTypes.number,
            subtaskIds: PropTypes.arrayOf(clientOrDatabaseIdType),
            // lists
            acl: PropTypes.exact({
                ownerId: PropTypes.number.isRequired,
                grants: PropTypes.objectOf(
                    PropTypes.oneOf(Object.values(AccessLevel))
                ),
            }),
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
