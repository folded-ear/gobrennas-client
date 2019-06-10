import { ReduceStore } from "flux/utils";
import Dispatcher from './dispatcher';
import TaskActions from "./TaskActions";
import LoadObject from "../util/LoadObject";
import TaskApi from "./TaskApi";
import hotLoadObject from "../util/hotLoadObject";
import ClientId from "../util/ClientId";
import { humanStringComparator } from "../util/comparators";

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
        throw new Error("Unsupported value passed to replaceId");
    };
    return idFixer;
};

const taskCreated = (state, clientId, id, task) => {
    const idFixer = idFixerFactory(clientId, id);
    const byId = {
        ...state.byId,
        [id]: LoadObject.withValue(task),
    };
    delete byId[clientId];
    if (task.parentId != null) {
        const plo = loForId(state, task.parentId);
        byId[task.parentId] = plo.map(p => ({
            ...p,
            subtaskIds: idFixer(p.subtaskIds),
        }))
    }
    return {
        ...state,
        activeTaskId: id,
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
    if (state.topLevelIds.getValueEnforcing().every(it => it !== id)) {
        throw new Error(`Task '${id}' is not a list.`);
    }
    state = {
        ...state,
        activeListId: id,
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
    if (id == null) {
        throw new Error(`No task has a null id.`);
    }
    const lo = state.byId[id];
    if (lo == null) {
        throw new Error(`No task '${id}' is known. You have a load race!`);
    }
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
    if (t.parentId == null) {
        throw new Error(`Can't create a task after root-level '${id}'`)
    }
    state = addTask(state, t.parentId, "", id);
    return state;
};

const createTaskBefore = (state, id) => {
    const t = taskForId(state, id);
    if (t.parentId == null) {
        throw new Error(`Can't create a task after root-level '${id}'`)
    }
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

const renameTask = (state, id, name) => {
    let lo = loForId(state, id);
    const task = lo.getValueEnforcing();
    if (task.name === name) return state;
    if (ClientId.is(id)) {
        if (lo.isDone())
            // todo: this needs to queue...
            TaskApi.createTask(name, task.parentId, id);
        lo = lo.creating();
    } else {
        if (lo.isDone())
            // todo: this needs to queue...
            TaskApi.renameTask(id, name);
        lo = lo.updating();
    }
    return {
        ...state,
        activeTaskId: id,
        byId: {
            ...state.byId,
            [id]: lo.map(t => ({
                ...t,
                name,
            })),
        }
    }
};

const focusTask = (state, id) => {
    taskForId(state, id);
    if (state.activeTaskId === id) return state;
    if (state.activeTaskId != null) {
        const prev = taskForId(state, state.activeTaskId);
        if (prev.name.trim() === "") {
            state = deleteTask(state, state.activeTaskId)
        }
    }
    return {
        ...state,
        activeTaskId: id,
        selectedTaskIds: null,
    };
};

const atIndexOrNull = (items, idx) =>
    idx >= 0 && idx < items.length
        ? items[idx]
        : null;

const getNeighborIds = (state, id, distance = 1) => {
    const t = taskForId(state, id);
    const siblingIds = t.parentId == null
        ? state.topLevelIds
        : taskForId(state, t.parentId).subtaskIds;
    const idx = siblingIds.indexOf(id);
    if (idx < 0) {
        throw new Error(`Task '${t.id}' isn't a child of it's parent ('${t.parentId}')?`)
    }
    return {
        before: atIndexOrNull(siblingIds, idx - distance),
        after: atIndexOrNull(siblingIds, idx + distance),
    };
};

const focusDelta = (state, id, delta) => {
    if (delta === 0) {
        console.warn("Focus by a delta of zero?");
        return state;
    }
    const {
        before,
        after,
    } = getNeighborIds(state, id, Math.abs(delta));
    const sid = delta < 0 ? before : after;
    return sid == null ? state : focusTask(state, sid);
};

const selectDelta = (state, id, delta) => {
    if (delta === 0) {
        console.warn("Select by a delta of zero?");
        return state;
    }
    if (delta !== 1 && delta !== -1) {
        throw new Error("Selection can't expand by more than one item at a time");
    }
    const {
        after: next,
    } = getNeighborIds(state, id, delta);
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

const completeTask = (state, id) => {
    return deleteTask(state, id);
};

const deleteTask = (state, id) => {
    const t = taskForId(state, id);
    if (t.parentId == null) {
        throw new Error(`Can't delete root-level task '${id}'`)
    }
    const p = taskForId(state, t.parentId);
    const idx = p.subtaskIds.indexOf(id);
    if (idx < 0) {
        throw new Error(`Task '${t.id}' isn't a child of it's parent ('${t.parentId}')?`)
    }
    const byId = {
        ...state.byId,
    };
    delete byId[id];
    byId[p.id] = {
        ...byId[p.id],
        subtaskIds: p.subtaskIds.slice(0, idx).concat(p.subtaskIds.slice(idx + 1)),
    };
    return {
        ...state,
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
        byId,
    };
};

const forwardDeleteTask = (state, id) => {
    const {
        before,
        after,
    } = getNeighborIds(state, id);
    if (before == null && after == null) {
        // can't delete the only item on a list
        return renameTask(state, id, "");
    }
    return {
        ...deleteTask(state, id),
        activeTaskId: after != null ? after : before,
    };
};

const backwardsDeleteTask = (state, id) => {
    const {
        before,
        after,
    } = getNeighborIds(state, id);
    if (before == null && after == null) {
        // can't delete the only item on a list
        return renameTask(state, id, "");
    }
    return {
        ...deleteTask(state, id),
        activeTaskId: before != null ? before : after,
    };
};

const moveDelta = (state, delta) => {
    const block = [state.activeTaskId];
    if (state.selectedTaskIds != null) {
        block.push(...state.selectedTaskIds);
    }
    const t = taskForId(state, state.activeTaskId);
    const p = taskForId(state, t.parentId);
    const sids = p.subtaskIds.slice();
    const idxs = block
        .map(id => sids.indexOf(id))
        .sort(delta < 1
            ? (a, b) => a - b
            : (a, b) => b - a);
    if (idxs[0] === 0) return state;
    if (idxs[0] === sids.length - 1) return state;
    // this isn't terribly efficient. but whatever.
    idxs.forEach(i => {
        const temp = sids[i + delta];
        sids[i + delta] = sids[i];
        sids[i] = temp;
    });
    return {
        ...state,
        byId: {
            ...state.byId,
            [p.id]: {
                ...p,
                subtaskIds: sids,
            },
        },
    };
};

const taskLoaded = (state, task) => {
    if (task.subtaskIds && task.subtaskIds.length > 0) {
        TaskApi.loadSubtasks(task.id);
        state = task.subtaskIds.reduce(taskLoading, state);
    }
    return {
        ...state,
        byId: {
            ...state.byId,
            [task.id]: LoadObject.withValue(task),
        },
    };
};

const taskLoading = (state, id) => {
    return {
        ...state,
        byId: {
            ...state.byId,
            [id]: LoadObject.loading(),
        },
    };
};

function taskRenamed(state, id, name) {
    return {
        ...state,
        byId: {
            ...state.byId,
            // despite thinking we'd want to save the name, we don't, because if
            // the user has made further changes while the save was in flight,
            // we want to save those.
            [id]: loForId(state, id).done(),
        },
    };
}

class TaskStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return {
            activeListId: null, // ID
            activeTaskId: null, // ID
            selectedTaskIds: null, // Array<ID>
            topLevelIds: LoadObject.empty(), // LoadObject<Array<ID>>
            byId: {}, // Map<ID, LoadObject<Task>>
        };
    }

    reduce(state, action) {
        switch (action.type) {
            case TaskActions.CREATE_LIST:
                return createList(state, action.name);
            case TaskActions.LIST_CREATED:
                return listCreated(
                    state,
                    action.clientId,
                    action.id,
                    action.data,
                );
            case TaskActions.LOAD_LISTS:
                TaskApi.loadLists();
                return {
                    ...state,
                    topLevelIds: state.topLevelIds.loading(),
                };
            case TaskActions.LISTS_LOADED:
                state = {
                    ...action.data.reduce(taskLoaded, state),
                    topLevelIds: LoadObject.withValue(action.data.map(t => t.id)),
                };
                if (action.data.length > 0) {
                    // auto-select the first one
                    state = selectList(state, action.data.sort(humanStringComparator)[0].id);
                }
                return state;
            case TaskActions.SELECT_LIST:
                return selectList(state, action.id);
            case TaskActions.SUBTASKS_LOADED:
                return action.data.reduce(taskLoaded, state);
            case TaskActions.RENAME_TASK:
                return renameTask(state, action.id, action.name);
            case TaskActions.TASK_RENAMED:
                return taskRenamed(state, action.id, action.name);
            case TaskActions.FOCUS:
                return focusTask(state, action.id);
            case TaskActions.FOCUS_NEXT:
                return focusDelta(state, action.id, 1);
            case TaskActions.FOCUS_PREVIOUS:
                return focusDelta(state, action.id, -1);
            case TaskActions.CREATE_TASK_AFTER:
                return createTaskAfter(state, action.id);
            case TaskActions.CREATE_TASK_BEFORE:
                return createTaskBefore(state, action.id);
            case TaskActions.TASK_CREATED:
                return taskCreated(
                    state,
                    action.clientId,
                    action.id,
                    action.data,
                );
            // case TaskActions.DELETE_TASK_FORWARD:
            //     return forwardDeleteTask(state, action.id);
            // case TaskActions.DELETE_TASK_BACKWARDS:
            //     return backwardsDeleteTask(state, action.id);
            // case TaskActions.MARK_COMPLETE:
            //     return completeTask(state, action.id);
            case TaskActions.SELECT_NEXT:
                return selectDelta(state, action.id, 1);
            case TaskActions.SELECT_PREVIOUS:
                return selectDelta(state, action.id, -1);
            // case TaskActions.MOVE_NEXT:
            //     return moveDelta(state, 1);
            // case TaskActions.MOVE_PREVIOUS:
            //     return moveDelta(state, -1);
            default:
                return state;
        }
    }

    getLists() {
        const s = this.getState();
        return hotLoadObject(
            () => s.topLevelIds,
            () => Dispatcher.dispatch({
                type: TaskActions.LOAD_LISTS,
            }),
        ).map(ids => tasksForIds(s, ids));
    }

    getSubtaskLOs(id) {
        const s = this.getState();
        const p = taskForId(s, id);
        return losForIds(s, p.subtaskIds);
    }

    getActiveListLO() {
        const s = this.getState();
        return s.activeListId == null
            ? null
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

}

export default new TaskStore();
