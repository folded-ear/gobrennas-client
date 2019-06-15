import { ReduceStore } from "flux/utils";
import Dispatcher from './dispatcher';
import { Map } from "immutable";
import UserActions from "./UserActions";
import TaskActions from "./TaskActions";
import { LOCAL_STORAGE_PREFERENCES } from "../constants/index";

const Prefs = {
    ACTIVE_TASK_LIST: "activeTaskList",
};

const setPref = (state, key, value) => {
    state = state.set(key, value);
    localStorage.setItem(LOCAL_STORAGE_PREFERENCES, JSON.stringify(state.toJSON()));
    return state;
};

class PreferencesStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        const preferences = localStorage.getItem(LOCAL_STORAGE_PREFERENCES);
        if (preferences != null) {
            try {
                return new Map(JSON.parse(preferences));
            } catch (e) {
                console.warn("error restoring preferences", e);
            }
        }
        return new Map();
    }

    reduce(state, action) {
        switch (action.type) {
            case UserActions.RESTORE_PREFERENCES: {
                return new Map(action.preferences);
            }
            case TaskActions.SELECT_LIST: {
                return setPref(state, Prefs.ACTIVE_TASK_LIST, action.id);
            }
            default:
                return state;
        }
    }

    getActiveTaskList() {
        return this.getState().get(Prefs.ACTIVE_TASK_LIST);
    }
}

export default new PreferencesStore();