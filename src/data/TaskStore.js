import dotProp from "dot-prop-immutable";
import { ReduceStore } from "flux/utils";
import invariant from "invariant";
import PropTypes from "prop-types";
import ClientId, { clientOrDatabaseIdType } from "../util/ClientId";
import { humanStringComparator } from "../util/comparators";
import hotLoadObject from "../util/hotLoadObject";
import LoadObject from "../util/LoadObject";
import loadObjectOf from "../util/loadObjectOf";
import typedStore from "../util/typedStore";
import AccessLevel from "./AccessLevel";
import Dispatcher from "./dispatcher";
import PreferencesStore from "./PreferencesStore";
import RecipeActions from "./RecipeActions";
import RouteStore from "./RouteStore";
import TaskActions from "./TaskActions";
import TaskApi from "./TaskApi";
import { isParent } from "./tasks";
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

const taskCreated = (state, clientId, id, task) => {
    const idFixer = idFixerFactory(clientId, id);
    const byId = {
        ...state.byId,
        // despite thinking we'd want to save the name, we don't, because if
        // the user has made further changes while the save was in flight,
        // we want to save those.
        [id]: state.byId[clientId].done().map(t => ({
            ...t,
            id,
        })),
    };
    delete byId[clientId];
    if (tasksToRename.has(clientId)) {
        tasksToRename.set(id, tasksToRename.get(clientId));
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
    return {
        ...state,
        activeTaskId: idFixer(state.activeTaskId),
        byId,
    };
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
    return state;
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
    parentsToReset.add(parentId);
    inTheFuture(TaskActions.FLUSH_REORDERS);
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

let tasksToRename = new Map();

const flushTasksToRename = state => {
    if (tasksToRename.size === 0) return state;
    const requeue = new Map();
    for (const [id, name] of tasksToRename) {
        if (ClientId.is(id)) {
            requeue.set(id, name);
        } else {
            TaskApi.renameTask(id, name);
        }
    }
    tasksToRename = requeue;
    return state;
};

const timeoutRegistry = new Map();

const inTheFuture = (action, delay = 2) => {
    if (timeoutRegistry.has(action)) {
        clearTimeout(timeoutRegistry.get(action));
    }
    timeoutRegistry.set(action, setTimeout(() => {
        Dispatcher.dispatch({
            type: action,
        });
    }, delay * 1000));
};

const renameTask = (state, id, name) => {
    let lo = loForId(state, id);
    const task = lo.getValueEnforcing();
    if (task.name === name) return state;
    if (ClientId.is(id)) {
        if (lo.isDone()) { // really means "hasn't started yet"
            TaskApi.createTask(name, task.parentId, id);
            lo = lo.creating();
        } else {
            tasksToRename.set(id, name);
            inTheFuture(TaskActions.FLUSH_RENAMES);
        }
    } else {
        tasksToRename.set(id, name);
        inTheFuture(TaskActions.FLUSH_RENAMES);
        if (lo.isDone()) {
            lo = lo.updating();
        }
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
        if (prev.name.trim() === "") {
            state = deleteTask(state, state.activeTaskId);
        }
    }
    return {
        ...state,
        activeTaskId: id,
        selectedTaskIds: null,
    };
};

const getNeighborIds = (state, id) => ({
    before: getNeighborId(state, id, -1),
    after: getNeighborId(state, id, 1),
});

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
        if (crossGenerations && isParent(t)) return t.subtaskIds[0];
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
        if (crossGenerations) return t.parentId;
        return null;
    }
};

const lastDescendantIdOf = (state, id) => {
    while (id != null) {
        const desc = taskForId(state, id);
        if (!isParent(desc)) return desc.id;
        id = desc.subtaskIds[desc.subtaskIds.length - 1];
    }
    return null;
};

const focusDelta = (state, id, delta) => {
    if (delta === 0) {
        return state;
    }
    const sid = getNeighborId(state, id, delta, true);
    return sid == null ? state : focusTask(state, sid);
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

// complete/delete are the "same" action as far as the client is concerned, at
// least for now. That is, they both say "hey server, delete me" and then forget
// about the task. The server does a little more processing for a complete than
// a delete, but the end result is the same: DELETE FROM task WHERE id = ?
let tasksToDelete = new Map();

const flushTasksToDelete = state => {
    if (tasksToDelete.size === 0) return state;
    for (const [id, asCompletion] of tasksToDelete) {
        if(asCompletion) {
            TaskApi.completeTask(id);
        } else {
            TaskApi.deleteTask(id);
        }
    }
    tasksToDelete.clear();
    return state;
};

const completeTask = (state, id) => {
    return forwardDeleteTask(state, id, true);
};

const deleteTask = (state, id, asCompletion = false) => {
    let lo = loForId(state, id);
    const t = lo.getValueEnforcing();
    invariant(
        t.parentId != null,
        "Can't %s root-level task '%s'",
        asCompletion ? "complete" : "delete",
        id,
    );
    state = {
        ...state,
        activeTaskId: null,
        selectedTaskIds: null,
        byId: {
            ...state.byId,
            [id]: lo.map(t => ({
                ...t,
                _complete: asCompletion,
            })).deleting(),
        },
    };

    if (ClientId.is(id)) {
        state = taskDeleted(state, id);
    } else {
        tasksToDelete.set(id, asCompletion);
        inTheFuture(TaskActions.FLUSH_DELETES, 10);
    }
    return state;
};

const taskUndoDelete = (state, id) => {
    tasksToDelete.delete(id);
    return {
        ...state,
        activeTaskId: id,
        byId: {
            ...state.byId,
            [id]: state.byId[id].map(t => {
                t = {...t};
                delete t._complete;
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

const directionalDeleteTaskBuilder = delta =>
    (state, id, asCompletion = false) => {
        let {
            before,
            after,
        } = getNeighborIds(state, id);
        if (before == null && after == null) {
            // can't have a zero-task list, so make a blank one
            state = createTaskAfter(state, id);
            after = getNeighborId(state, id, 1);
        }
        let activeTaskId = state.activeTaskId;
        if (activeTaskId === id) {
            activeTaskId = delta < 0
                ? before != null ? before : after
                : after != null ? after : before;
        }
        return {
            ...deleteTask(state, id, asCompletion),
            activeTaskId,
        };
    };

const forwardDeleteTask = directionalDeleteTaskBuilder(1);
const backwardsDeleteTask = directionalDeleteTaskBuilder(-1);

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
    return state;
};

const moveDelta = (state, delta) => {
    const block = [state.activeTaskId];
    if (state.selectedTaskIds != null) {
        block.push(...state.selectedTaskIds);
    }
    const t = taskForId(state, state.activeTaskId);
    const plo = loForId(state, t.parentId);
    const p = plo.getValueEnforcing();
    const sids = p.subtaskIds.slice();
    const idxs = block
        .map(id => sids.indexOf(id))
        .sort(delta < 1
            ? (a, b) => a - b
            : (a, b) => b - a);
    if (idxs[0] === 0 && delta < 0) return state;
    if (idxs[0] === sids.length - 1 && delta > 0) return state;
    // this isn't terribly efficient. but whatever.
    idxs.forEach(i => {
        const temp = sids[i + delta];
        sids[i + delta] = sids[i];
        sids[i] = temp;
    });
    parentsToReset.add(t.parentId);
    inTheFuture(TaskActions.FLUSH_REORDERS);
    return {
        ...state,
        byId: {
            ...state.byId,
            [p.id]: plo.map(p => ({
                ...p,
                subtaskIds: sids,
            })),
        },
    };
};

const nestTask = (state, id) => {
    const t = taskForId(state, id);
    const p = taskForId(state, t.parentId);
    const idx = p.subtaskIds.indexOf(t.id);
    if (idx === 0) {
        // nothing to nest under
        return state;
    }
    const np = taskForId(state, p.subtaskIds[idx - 1]);
    return resetParent(state, t, p, np);
};

const unnestTask = (state, id) => {
    const t = taskForId(state, id);
    const p = taskForId(state, t.parentId);
    if (p.id === state.activeListId) {
        // nothing to unnest from
        return state;
    }
    const np = taskForId(state, p.parentId);
    return resetParent(state, t, p, np);
};

const toggleExpanded = (state, id) =>
    dotProp.set(state, ["byId", id], lo => lo.map(t => ({
        ...t,
        _expanded: !t._expanded,
    })));

const resetParent = (state, task, parent, newParent) => {
    if (!ClientId.is(task.id)) {
        TaskApi.resetParent(task.id, newParent.id);
    }
    return {
        ...state,
        byId: {
            ...state.byId,
            // update its parentId
            [task.id]: state.byId[task.id].map(t => ({
                ...t,
                parentId: newParent.id,
            })),
            // remove it from its old parent
            [parent.id]: state.byId[parent.id].map(t => {
                const subtaskIds = t.subtaskIds.slice();
                subtaskIds.splice(parent.subtaskIds.indexOf(task.id), 1);
                return {
                    ...t,
                    subtaskIds,
                };
            }),
            // add it to its new parent
            [newParent.id]: state.byId[newParent.id].map(t => {
                const subtaskIds = (t.subtaskIds || []).slice();
                if (newParent.id === parent.parentId) {
                    const idx = newParent.subtaskIds.indexOf(parent.id);
                    if (idx >= 0) {
                        subtaskIds.splice(idx + 1, 0, task.id);
                    } else {
                        subtaskIds.push(task.id);
                    }
                } else {
                    subtaskIds.push(task.id);
                }
                return {
                    ...t,
                    subtaskIds,
                };
            }),
        },
    };
};

const loadSubtasks = (state, id, background = false) => {
    TaskApi.loadSubtasks(id, background);
    if (background) return state;
    return dotProp.set(
        state,
        ["byId", id],
        lo => lo.updating());
};

const taskLoaded = (state, task) => {
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
        state = loadSubtasks(state, task.id);
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

// noinspection JSUnusedLocalSymbols
const taskRenamed = (state, id) => ({
    ...state,
    byId: {
        ...state.byId,
        // despite thinking we'd want to save the name, we don't, because if
        // the user has made further changes while the save was in flight,
        // we want to save those.
        [id]: loForId(state, id).done(),
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
        ...lists.reduce(taskLoaded, state),
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

let lastUserActionTS = null;
const userAction = () =>
    lastUserActionTS = Date.now();
const msSinceUserAction = () =>
    Date.now() - lastUserActionTS;
userAction(); // loading the app!

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
                if (action.background && msSinceUserAction() < 10 * 1000) {
                    // they did something while in flight
                    return state;
                }
                return dotProp.set(
                    action.data.reduce(taskLoaded, state),
                    ["byId", action.id],
                    lo => lo.map(task => ({
                        ...task,
                        subtaskIds: action.data.map(it => it.id),
                    })).done()
                );
            }

            case TaskActions.RENAME_TASK:
                invariant(
                    action.id === state.activeTaskId,
                    "Renaming a non-active task is a bug.",
                );
                userAction();
                return renameTask(state, action.id, action.name);
            case TaskActions.TASK_RENAMED:
                return taskRenamed(state, action.id, action.name);
            case TaskActions.FOCUS:
                state = focusTask(state, action.id);
                return flushTasksToRename(state);
            case TaskActions.FOCUS_NEXT:
                state = focusDelta(state, action.id, 1);
                return flushTasksToRename(state);
            case TaskActions.FOCUS_PREVIOUS:
                state = focusDelta(state, action.id, -1);
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
                state = flushTasksToRename(state);
                return flushParentsToReset(state);
            case TaskActions.DELETE_TASK_FORWARD:
                userAction();
                return forwardDeleteTask(state, action.id);
            case TaskActions.DELETE_TASK_BACKWARDS:
                userAction();
                return backwardsDeleteTask(state, action.id);
            case TaskActions.TASK_UNDO_DELETE:
                return taskUndoDelete(state, action.id);
            case TaskActions.TASK_DELETED:
                return taskDeleted(state, action.id);
            case TaskActions.MARK_COMPLETE:
                userAction();
                return completeTask(state, action.id);
            case TaskActions.TASK_COMPLETED:
                return taskDeleted(state, action.id);
            case TaskActions.SELECT_NEXT:
                userAction();
                return selectDelta(state, action.id, 1);
            case TaskActions.SELECT_PREVIOUS:
                userAction();
                return selectDelta(state, action.id, -1);
            case TaskActions.SELECT_TO:
                userAction();
                return selectTo(state, action.id);
            case TaskActions.MOVE_NEXT:
                userAction();
                return moveDelta(state, 1);
            case TaskActions.MOVE_PREVIOUS:
                userAction();
                return moveDelta(state, -1);

            case TaskActions.NEST: {
                if (state.selectedTaskIds != null) {
                    alert("Can't nest/unnest multiple tasks (at the moment)");
                    return state;
                }
                userAction();
                return nestTask(state, action.id);
            }

            case TaskActions.UNNEST: {
                if (state.selectedTaskIds != null) {
                    alert("Can't nest/unnest multiple tasks (at the moment)");
                    return state;
                }
                userAction();
                return unnestTask(state, action.id);
            }

            case TaskActions.TOGGLE_EXPANDED: {
                userAction();
                return toggleExpanded(state, action.id);
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
                return lines.reduce((s, l) => {
                    s = createTaskAfter(s, s.activeTaskId);
                    s = renameTask(s, s.activeTaskId, l);
                    return s;
                }, state);
            }

            case TaskActions.FLUSH_RENAMES:
                return flushTasksToRename(state);
            case TaskActions.FLUSH_REORDERS:
                return flushParentsToReset(state);
            case TaskActions.FLUSH_DELETES:
                return flushTasksToDelete(state);

            case RecipeActions.SHOPPING_LIST_ASSEMBLED: {
                // todo: this is stupid. not wrong though.
                return {
                    ...state,
                    topLevelIds: LoadObject.empty(),
                };
            }

            case TemporalActions.EVERY_15_SECONDS: {
                if (msSinceUserAction() < 1000 * 15) return state;
                if (state.activeListId == null) return state;
                if (RouteStore.getMatch().path !== "/tasks") return state;
                if (!WindowStore.isVisible()) return state;
                if (!WindowStore.isFocused()) return state;
                return loadSubtasks(state, state.activeListId, true);
            }

            case WindowActions.VISIBILITY_CHANGE: {
                if (state.activeListId == null) return state;
                if (RouteStore.getMatch().path !== "/tasks") return state;
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
            id: clientOrDatabaseIdType.isRequired,
            name: PropTypes.string.isRequired,
            acl: PropTypes.exact({
                ownerId: PropTypes.number.isRequired,
                grants: PropTypes.objectOf(
                    PropTypes.oneOf(Object.values(AccessLevel))
                ),
            }),
            parentId: PropTypes.number,
            subtaskIds: PropTypes.arrayOf(clientOrDatabaseIdType),
            _expanded: PropTypes.bool,
            _complete: PropTypes.bool,
        }))
    ).isRequired,
};

export default typedStore(new TaskStore(Dispatcher));
