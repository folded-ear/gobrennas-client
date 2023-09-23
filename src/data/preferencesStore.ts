import PlanActions from "features/Planner/data/PlanActions";
import planStore from "features/Planner/data/planStore";
import { ReduceStore } from "flux/utils";
import { Map } from "immutable";
import {
  getJsonItem,
  setJsonItem
} from "util/storage";
// noinspection ES6PreferShortImport
import { LOCAL_STORAGE_PREFERENCES } from "../constants/index";
import Dispatcher from "./dispatcher";
import UserActions from "./UserActions";
import { FluxAction } from "global/types/types";

const PrefNames = {
    ACTIVE_TASK_LIST: "activeTaskList",
    ACTIVE_PLAN: "activePlan",
    DEV_MODE: "devMode",
};

type State = Map<string, any>;
type IsMigrationNeeded = (p: State) => boolean;
type DoMigration = (p: State) => State;
type Migration = [IsMigrationNeeded, DoMigration];

const migrations: Migration[] = [
    [
        (prefs) =>
            prefs.has(PrefNames.ACTIVE_TASK_LIST) &&
            !prefs.has(PrefNames.ACTIVE_PLAN),
        (prefs) => {
            prefs = prefs.set(
                PrefNames.ACTIVE_PLAN,
                prefs.get(PrefNames.ACTIVE_TASK_LIST),
            );
            return prefs.delete(PrefNames.ACTIVE_TASK_LIST);
        },
    ],
];

const setPref = (state: State, key: string, value: any): State => {
    state = state.set(key, value);
    setJsonItem(LOCAL_STORAGE_PREFERENCES, state);
    return state;
};

class PreferencesStore extends ReduceStore<State, FluxAction> {
    getInitialState(): State {
        return migrations.reduce(
            (prefs, [test, mig]) => (test(prefs) ? mig(prefs) : prefs),
            Map(getJsonItem(LOCAL_STORAGE_PREFERENCES) as State),
        );
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case UserActions.RESTORE_PREFERENCES: {
                return Map(action.preferences);
            }
            case PlanActions.PLANS_LOADED: {
                this.__dispatcher.waitFor([planStore.getDispatchToken()]);
                const lo = planStore.getActivePlanLO();
                return lo.hasValue()
                    ? setPref(
                          state,
                          PrefNames.ACTIVE_PLAN,
                          lo.getValueEnforcing().id,
                      )
                    : state;
            }
            case PlanActions.SELECT_PLAN:
            case PlanActions.PLAN_CREATED: {
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
