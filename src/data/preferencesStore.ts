import TaskActions from "features/Planner/data/TaskActions";
import TaskStore from "features/Planner/data/TaskStore";
import { ReduceStore } from "flux/utils";
import { Map } from "immutable";
import {
    getJsonItem,
    setJsonItem,
} from "util/storage";
// noinspection ES6PreferShortImport
import { LOCAL_STORAGE_PREFERENCES } from "../constants/index";
import Dispatcher from "./dispatcher";
import UserActions from "./UserActions";

const PrefNames = {
    ACTIVE_TASK_LIST: "activeTaskList",
    ACTIVE_PLAN: "activePlan",
    DEV_MODE: "devMode",
};

type Prefs = Map<string, any>
type IsMigrationNeeded = (p: Prefs) => boolean
type DoMigration = (p: Prefs) => Prefs
type Migration = [ IsMigrationNeeded, DoMigration ]

const migrations: Migration[] = [
    [
        prefs => prefs.has(PrefNames.ACTIVE_TASK_LIST) && !prefs.has(PrefNames.ACTIVE_PLAN),
        prefs => {
            prefs = prefs.set(PrefNames.ACTIVE_PLAN, prefs.get(PrefNames.ACTIVE_TASK_LIST));
            return prefs.delete(PrefNames.ACTIVE_TASK_LIST);
        },
    ],
];

const setPref = (state, key, value) => {
    state = state.set(key, value);
    setJsonItem(LOCAL_STORAGE_PREFERENCES, state);
    return state;
};

class PreferencesStore extends ReduceStore<Prefs, any> {

    getInitialState() {
        return migrations.reduce((prefs, [ test, mig ]) =>
                test(prefs)
                    ? mig(prefs)
                    : prefs,
            Map(getJsonItem(LOCAL_STORAGE_PREFERENCES) as Prefs));
    }

    reduce(state, action) {
        switch (action.type) {
            case UserActions.RESTORE_PREFERENCES: {
                return Map(action.preferences);
            }
            case TaskActions.LISTS_LOADED: {
                this.__dispatcher.waitFor([
                    TaskStore.getDispatchToken(),
                ]);
                const lo = TaskStore.getActiveListLO();
                return lo.hasValue()
                    ? setPref(state, PrefNames.ACTIVE_PLAN, lo.getValueEnforcing().id)
                    : state;
            }
            case TaskActions.SELECT_LIST:
            case TaskActions.LIST_CREATED: {
                return setPref(state, PrefNames.ACTIVE_PLAN, action.id);
            }
            case UserActions.SET_DEV_MODE: {
                return setPref(state, PrefNames.DEV_MODE, action.enabled);
            }
            default:
                return state;
        }
    }

    getActivePlan() {
        return this.getState().get(PrefNames.ACTIVE_PLAN);
    }

    isDevMode() {
        return this.getState().get(PrefNames.DEV_MODE) || false;
    }
}

export default new PreferencesStore(Dispatcher);
