import { ReduceStore } from "flux/utils";
import Dispatcher from './dispatcher';
import TaskActions from "./TaskActions";
import LoadObject from "../util/LoadObject";
import TaskApi from "./TaskApi";
import hotLoadObject from "../util/hotLoadObject";

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
        topLevelIds: state.topLevelIds.map(ids => ids.concat(task.id)),
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
    if (state.topLevelIds.getValueEnforcing().every(it => it !== id)) {
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
            // case TaskActions.CREATE_LIST:
            //     return createList(state, action.name);
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
                    state = selectList(state, action.data[0].id);
                }
                return state;
            case TaskActions.SELECT_LIST:
                return selectList(state, action.id);
            case TaskActions.SUBTASKS_LOADED:
                return action.data.reduce(taskLoaded, state);
            // case TaskActions.RENAME_TASK:
            //     return renameTask(state, action.id, action.name);
            case TaskActions.FOCUS:
                return focusTask(state, action.id);
            case TaskActions.FOCUS_NEXT:
                return focusDelta(state, action.id, 1);
            case TaskActions.FOCUS_PREVIOUS:
                return focusDelta(state, action.id, -1);
            // case TaskActions.CREATE_TASK_AFTER:
            //     return createTaskAfter(state, action.id);
            // case TaskActions.CREATE_TASK_BEFORE:
            //     return createTaskBefore(state, action.id);
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

    getActiveList() {
        const s = this.getState();
        return s.activeListId == null
            ? null
            : taskForId(s, s.activeListId);
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
