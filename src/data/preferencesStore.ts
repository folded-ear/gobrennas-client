import planStore from "@/features/Planner/data/planStore";
import { getJsonItem, setJsonItem } from "@/util/storage";
import { ReduceStore } from "flux/utils";
import { Map } from "immutable";
// noinspection ES6PreferShortImport
import { LOCAL_STORAGE_PREFERENCES } from "@/constants/index";
import { BfsId, ensureString } from "@/global/types/identity";
import { Maybe } from "graphql/jsutils/Maybe";
import dispatcher, { ActionType, FluxAction } from "./dispatcher";
import shoppingStore from "./shoppingStore";

export type Layout = "desktop" | "mobile" | "auto";

enum PrefNames {
    ACTIVE_TASK_LIST = "activeTaskList",
    ACTIVE_PLAN = "activePlan",
    ACTIVE_SHOPPING_PLANS = "activeShoppingPlans",
    DEV_MODE = "devMode",
    LAYOUT = "layout",
    NAV_COLLAPSED = "navCollapsed",
}

type State = Map<string, unknown>;
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

const setPref = (state: State, key: string, value: unknown): State => {
    state = state.set(key, value);
    setJsonItem(LOCAL_STORAGE_PREFERENCES, state);
    return state;
};

const clearPref = (state: State, key: string): State => {
    state = state.delete(key);
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
            case ActionType.USER__RESTORE_PREFERENCES: {
                return Map(action.preferences);
            }

            case ActionType.PLAN__SELECT_PLAN:
            case ActionType.PLAN__PLAN_CREATED:
            case ActionType.PLAN__DELETE_PLAN:
            case ActionType.PLAN__PLAN_DELETED:
            case ActionType.PLAN__PLANS_LOADED: {
                this.__dispatcher.waitFor([planStore.getDispatchToken()]);
                const rlo = planStore.getActivePlanRlo();
                return rlo.data
                    ? setPref(state, PrefNames.ACTIVE_PLAN, rlo.data.id)
                    : clearPref(state, PrefNames.ACTIVE_PLAN);
            }

            case ActionType.SHOPPING__TOGGLE_PLAN: {
                this.__dispatcher.waitFor([shoppingStore.getDispatchToken()]);
                return setPref(
                    state,
                    PrefNames.ACTIVE_SHOPPING_PLANS,
                    shoppingStore.getActivePlanIds(),
                );
            }

            case ActionType.USER__SET_DEV_MODE: {
                if (!action.enabled) {
                    state = clearPref(state, PrefNames.LAYOUT);
                }
                // noinspection PointlessBooleanExpressionJS
                return setPref(state, PrefNames.DEV_MODE, !!action.enabled);
            }

            case ActionType.USER__SET_LAYOUT: {
                return setPref(state, PrefNames.LAYOUT, action.layout);
            }

            case ActionType.USER__SET_NAV_COLLAPSED: {
                // noinspection PointlessBooleanExpressionJS
                return setPref(
                    state,
                    PrefNames.NAV_COLLAPSED,
                    !!action.collapsed,
                );
            }

            default:
                return state;
        }
    }

    getActivePlan(): Maybe<BfsId> {
        return <BfsId>this.getState().get(PrefNames.ACTIVE_PLAN);
    }

    getActiveShoppingPlans(): BfsId[] {
        let plans = <Maybe<Array<any> | string>>(
            this.getState().get(PrefNames.ACTIVE_SHOPPING_PLANS)
        );
        if (plans == null || typeof plans === "string" || plans.length === 0) {
            const activePlanId = this.getActivePlan();
            plans = activePlanId != null ? [activePlanId] : [];
        } else {
            plans = plans.map(ensureString);
        }
        return plans;
    }

    isDevMode() {
        return !!this.getState().get(PrefNames.DEV_MODE);
    }

    getLayout(): Layout {
        return <Layout>this.getState().get(PrefNames.LAYOUT) ?? "auto";
    }

    isNavCollapsed() {
        return !!this.getState().get(PrefNames.NAV_COLLAPSED);
    }
}

export default new PreferencesStore(dispatcher);
