import { ReduceStore } from "flux/utils";
import Dispatcher from './dispatcher';
import TaskActions from "./TaskActions";
import localCacheStore from "../util/localCacheStore";

const createList = (state, name) => {
    const id_seq = state.id_seq + 1;
    const id = "c" + id_seq;
    return {
        ...state,
        id_seq,
        activeListId: id,
        topLevelIds: state.topLevelIds.concat(id),
        byId: {
            ...state.byId,
            [id]: {
                id,
                name,
            }
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

class TaskStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return {
            id_seq: 0,
            activeListId: null,
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
            default:
                return state;
        }
    }

    getTopLevelTasks() {
        const s = this.getState();
        return s.topLevelIds.map(id => s.byId[id]);
    }

    getActiveListId() {
        return this.getState().activeListId;
    }
}

export default localCacheStore("TaskStore", new TaskStore());