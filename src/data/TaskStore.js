import { ReduceStore } from "flux/utils";
import Dispatcher from './dispatcher';
import TaskActions from "./TaskActions";
import localCacheStore from "../util/localCacheStore";

/*
 * This store is way too muddled. But leaving it that way for the moment, to
 * avoid introducing too much "spray" during the early stages. It can be chopped
 * up in the future.
 */

const CLIENT_ID_PREFIX = "c";
const AT_END = Math.random();

const _newTask = (state, name) => {
    const id_seq = state.id_seq + 1;
    const id = CLIENT_ID_PREFIX + id_seq;
    return {
        id_seq,
        task: {
            id,
            name,
        }
    }
};

const createList = (state, name) => {
    const {
        id_seq,
        task,
    } = _newTask(state, name);
    return addTask({
        ...state,
        id_seq,
        activeListId: task.id,
        activeTaskId: null,
        topLevelIds: state.topLevelIds.concat(task.id),
        byId: {
            ...state.byId,
            [task.id]: task,
        },
    }, task.id, "");
};

const selectList = (state, id) => {
    if (state.activeListId === id) return state;
    // only valid ids, please
    const list = taskForId(state, id);
    if (state.topLevelIds.every(it => it !== id)) {
        throw new Error(`Task '${id}' is not a list.`);
    }
    return {
        ...state,
        activeListId: id,
        activeTaskId: list.subtaskIds
            ? list.subtaskIds[0]
            : null,
    };
};

const taskForId = (state, id) => {
    if (id == null) {
        throw new Error(`No task has a null id.`);
    }
    const t = state.byId[id];
    if (t == null) {
        throw new Error(`No task '${id}' is known`);
    }
    return t;
};

const tasksForIds = (state, ids) =>
    ids == null ? [] : ids.map(id =>
        taskForId(state, id));

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
    let parent = taskForId(state, parentId);
    const {
        id_seq,
        task,
    } = _newTask(state, name);
    parent = {
        ...parent,
        subtaskIds: spliceIds(parent.subtaskIds, task.id, after),
    };
    return {
        ...state,
        id_seq,
        activeTaskId: task.id,
        byId: {
            ...state.byId,
            [parent.id]: parent,
            [task.id]: {
                ...task,
                parentId,
            },
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
    const task = taskForId(state, id);
    if (task.name === name) return state;
    return {
        ...state,
        activeTaskId: id,
        byId: {
            ...state.byId,
            [id]: {
                ...task,
                name,
            },
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
    const newById = {
        ...state.byId,
    };
    delete newById[id];
    newById[p.id] = {
        ...newById[p.id],
        subtaskIds: p.subtaskIds.slice(0, idx).concat(p.subtaskIds.slice(idx + 1)),
    };
    return {
        ...state,
        activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
        byId: newById,
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

class TaskStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return {
            id_seq: 0,
            activeListId: null,
            activeTaskId: null,
            topLevelIds: [],
            byId: {},
        };
    }

    reduce(state, action) {
        switch (action.type) {
            case TaskActions.CREATE_LIST:
                return createList(state, action.name);
            case TaskActions.SELECT_LIST:
                return selectList(state, action.id);
            case TaskActions.RENAME:
                return renameTask(state, action.id, action.name);
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
            case TaskActions.FORWARD_DELETE_TASK:
                return forwardDeleteTask(state, action.id);
            case TaskActions.BACKWARDS_DELETE_TASK:
                return backwardsDeleteTask(state, action.id);
            case TaskActions.MARK_COMPLETE:
                return completeTask(state, action.id);
            default:
                return state;
        }
    }

    getLists() {
        const s = this.getState();
        return tasksForIds(s, s.topLevelIds);
    }

    getChildTasks(containerId) {
        const s = this.getState();
        const p = s.byId[containerId];
        if (p == null) {
            throw new Error(`Unknown '${containerId}' task container`);
        }
        return tasksForIds(s, p.subtaskIds);
    }

    getActiveList() {
        const s = this.getState();
        return s.activeListId == null
            ? null
            : taskForId(s, s.activeListId);
    }

    getActiveTask() {
        const s = this.getState();
        return s.activeTaskId == null
            ? null
            : taskForId(s, s.activeTaskId);
    }

}

export default localCacheStore("TaskStore", new TaskStore());