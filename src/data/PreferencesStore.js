import { ReduceStore } from "flux/utils";
import { Map } from "immutable";
import { LOCAL_STORAGE_PREFERENCES } from "../constants/index";
import {
    getJsonItem,
    setJsonItem,
} from "../util/storage";
import Dispatcher from "./dispatcher";
import TaskActions from "./TaskActions";
import UserActions from "./UserActions";
import UserStore from "./UserStore";

const Prefs = {
    ACTIVE_TASK_LIST: "activeTaskList",
    DEV_MODE: "devMode",
};

const setPref = (state, key, value) => {
    state = state.set(key, value);
    setJsonItem(LOCAL_STORAGE_PREFERENCES, state);
    return state;
};

class PreferencesStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return new Map(getJsonItem(LOCAL_STORAGE_PREFERENCES));
    }

    reduce(state, action) {
        switch (action.type) {
            case UserActions.RESTORE_PREFERENCES: {
                return new Map(action.preferences);
            }
            case TaskActions.SELECT_LIST: {
                return setPref(state, Prefs.ACTIVE_TASK_LIST, action.id);
            }
            case UserActions.SET_DEV_MODE: {
                if (!UserStore.isDeveloper()) return state;
                return setPref(state, Prefs.DEV_MODE, action.enabled);
            }
            default:
                return state;
        }
    }

    getActiveTaskList() {
        return this.getState().get(Prefs.ACTIVE_TASK_LIST);
    }

    isDevMode() {
        return this.getState().get(Prefs.DEV_MODE);
    }
}

export default new PreferencesStore();