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
const EMPTY_TASK_ID_PREFIX = "EMPTY_TASK_ID:";

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
    return {
        ...state,
        id_seq,
        activeListId: task.id,
        topLevelIds: state.topLevelIds.concat(task.id),
        byId: {
            ...state.byId,
            [task.id]: task,
        },
    };
};

const selectList = (state, id) => {
    // only valid ids, please
    if (! state.byId.hasOwnProperty(id)) {
        throw new Error(`Unknown '${id}' list.`);
    }
    if (state.topLevelIds.every(it => it !== id)) {
        throw new Error(`Task '${id}' is not a list.`);
    }
    return {
        ...state,
        activeListId: id,
    };
};

const taskForId = (state, id) => {
    const t = state.byId[id];
    if (t == null) {
        throw new Error(`No tast '${id}' is known`);
    }
    return t;
};

const tasksForIds = (state, ids) =>
    ids == null ? [] : ids.map(id =>
        taskForId(state, id));

const addTask = (state, parentId, name) => {
    let parent = taskForId(state, parentId);
    const {
        id_seq,
        task,
    } = _newTask(state, name);
    parent = {
        ...parent,
        subtaskIds: parent.hasOwnProperty("subtaskIds")
            ? parent.subtaskIds.concat(task.id)
            : [task.id],
    };
    return {
        ...state,
        id_seq,
        activeTaskId: task.id,
        byId: {
            ...state.byId,
            [parent.id]: parent,
            [task.id]: task,
        },
    };
};

const renameTask = (state, id, name) => {
    if (typeof id === "string" && id.indexOf(EMPTY_TASK_ID_PREFIX) === 0) {
        // it's the implicit empty one
        let parentId = id.substr(EMPTY_TASK_ID_PREFIX.length);
        if (parentId.charAt(0) !== CLIENT_ID_PREFIX) {
            parentId = parseInt(parentId);
        }
        return addTask(state, parentId, name);
    } else {
        return {
            ...state,
            activeTaskId: id,
            byId: {
                ...state.byId,
                [id]: {
                    ...taskForId(state, id),
                    name,
                },
            }
        }
    }
};

const focusTask = (state, id) => {
    taskForId(state, id);
    return {
        ...state,
        activeTaskId: id,
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
        const realTasks = tasksForIds(s, p.subtaskIds);
        realTasks.push({
            id: EMPTY_TASK_ID_PREFIX + containerId,
            name: "",
        });
        return realTasks;
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