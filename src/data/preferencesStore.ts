import planStore from "@/features/Planner/data/planStore";
import { getJsonItem, setJsonItem } from "@/util/storage";
import { ReduceStore } from "flux/utils";
import { Map as ImmMap } from "immutable";
// noinspection ES6PreferShortImport
import { LOCAL_STORAGE_PREFERENCES } from "@/constants/index";
import deviceKey from "@/data/utils/deviceKey";
import { deserialize, serialize } from "@/data/utils/serialization";
import { BfsId } from "@/global/types/identity";
import { client as apolloClient } from "@/providers/ApolloClient";
import promiseFlux from "@/util/promiseFlux";
import { gql } from "@/__generated__";
import { DataType, SetPreferenceMutation } from "@/__generated__/graphql";
import { FetchResult } from "@apollo/client";
import { Maybe } from "graphql/jsutils/Maybe";
import dispatcher, { ActionType, FluxAction } from "./dispatcher";
import shoppingStore from "./shoppingStore";

export type Layout = "desktop" | "mobile" | "auto";

type State = ImmMap<string, unknown>;

enum PrefName {
    ACTIVE_PLAN = "activePlan",
    ACTIVE_SHOPPING_PLANS = "activeShoppingPlans",
    CANONICAL_SERVER = "canonicalServer",
    DEV_MODE = "devMode",
    LAYOUT = "layout",
    NAV_COLLAPSED = "navCollapsed",
}

const TYPES: Record<PrefName, DataType> = {
    activePlan: DataType.ID,
    activeShoppingPlans: DataType.SET_OF_IDS,
    canonicalServer: DataType.BOOLEAN,
    devMode: DataType.BOOLEAN,
    layout: DataType.STRING,
    navCollapsed: DataType.BOOLEAN,
};

// alias the result so it's the same shape as SET_PREF
const CLEAR_PREF = gql(`
mutation clearPreference($name: String!, $deviceKey: String) {
  profile {
    update: clearPreference(name: $name, deviceKey: $deviceKey) {
      type
      value
    }
  }
}`);

// alias the result so it's the same shape as CLEAR_PREF
const SET_PREF = gql(`
mutation setPreference($name: String!, $deviceKey: String, $value: String!) {
  profile {
    update: setPreference(name: $name, deviceKey: $deviceKey, value: $value) {
      type
      value
    }
  }
}`);

const LOAD_PREFS = gql(`
query loadPreferences($deviceKey: String) {
  profile {
    me {
      preferences(deviceKey: $deviceKey) {
        name
        type
        value
      }
    }
  }
}`);

function saveToCache(state: State) {
    setJsonItem(LOCAL_STORAGE_PREFERENCES, state);
    return state;
}

function promiseServerUpdate(
    name: PrefName,
    value: string,
): Promise<FetchResult<SetPreferenceMutation>> {
    return apolloClient.mutate({
        mutation: SET_PREF,
        variables: {
            name,
            deviceKey,
            value,
        },
    });
}

function loadFromServer() {
    return promiseFlux(
        apolloClient.query({
            query: LOAD_PREFS,
            variables: { deviceKey },
        }),
        ({ data }): FluxAction => {
            const preferences = data!.profile.me.preferences.map(
                (p): [string, unknown] => [
                    p.name,
                    deserialize(p.type, p.value),
                ],
            );
            preferences.push([PrefName.CANONICAL_SERVER, true]);
            return {
                type: ActionType.USER__PREFERENCES_LOADED,
                preferences,
            };
        },
    );
}

function setPref(state: State, name: PrefName, value: unknown): State {
    if (state.get(name) === value) return state;
    const serialized = serialize(TYPES[name], value);
    let promise;
    if (serialized == null) {
        state = state.delete(name);
        promise = apolloClient.mutate({
            mutation: CLEAR_PREF,
            variables: {
                name,
                deviceKey,
            },
        });
    } else {
        state = state.set(name, deserialize(TYPES[name], serialized));
        promise = promiseServerUpdate(name, serialized);
    }
    promiseFlux(promise, ({ data }): FluxAction => {
        const p = data!.profile.update;
        return {
            type: ActionType.USER__PREFERENCES_LOADED,
            preferences: [[name, deserialize(p.type, p.value)]],
        };
    });
    return saveToCache(state);
}

class PreferencesStore extends ReduceStore<State, FluxAction> {
    getInitialState(): State {
        const cache = getJsonItem(LOCAL_STORAGE_PREFERENCES) ?? {
            // if nothing exists, the server is already canonical
            [PrefName.CANONICAL_SERVER]: true,
        };
        return ImmMap(cache) as State;
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case ActionType.USER__AUTHENTICATED: {
                if (state.get(PrefName.CANONICAL_SERVER)) {
                    // noinspection JSIgnoredPromiseFromCall
                    loadFromServer();
                    return state;
                }
                // Sending prefs individually is silly, but migration is one-shot.
                let queue: Promise<unknown> = Promise.resolve();
                for (const n of state.keys()) {
                    let v = state.get(n);
                    if (v == null) continue;
                    // These should already be strings, but just in case...
                    if (n === PrefName.ACTIVE_PLAN) {
                        v = "" + v;
                    } else if (n === PrefName.ACTIVE_SHOPPING_PLANS) {
                        v =
                            v instanceof Array && v.length
                                ? v.map((it) => "" + it)
                                : null;
                    }
                    queue = queue.then(() => {
                        const name = n as PrefName;
                        const serialized = serialize(TYPES[name], v);
                        return serialized
                            ? promiseServerUpdate(name, serialized)
                            : null;
                    });
                }
                // finally, refresh from the server
                queue.then(() => loadFromServer());
                return state;
            }

            case ActionType.USER__PREFERENCES_LOADED: {
                return saveToCache(
                    action.preferences.reduce(
                        (s, [n, v]) => (v == null ? s.delete(n) : s.set(n, v)),
                        state,
                    ),
                );
            }

            case ActionType.PLAN__SELECT_PLAN:
            case ActionType.PLAN__PLAN_CREATED:
            case ActionType.PLAN__DELETE_PLAN:
            case ActionType.PLAN__PLAN_DELETED:
            case ActionType.PLAN__PLANS_LOADED: {
                this.__dispatcher.waitFor([planStore.getDispatchToken()]);
                const rlo = planStore.getActivePlanRlo();
                return setPref(state, PrefName.ACTIVE_PLAN, rlo.data?.id);
            }

            case ActionType.SHOPPING__TOGGLE_PLAN: {
                this.__dispatcher.waitFor([shoppingStore.getDispatchToken()]);
                return setPref(
                    state,
                    PrefName.ACTIVE_SHOPPING_PLANS,
                    shoppingStore.getActivePlanIds(),
                );
            }

            case ActionType.USER__SET_DEV_MODE: {
                if (!action.enabled) {
                    state = setPref(state, PrefName.LAYOUT, undefined);
                }
                // noinspection PointlessBooleanExpressionJS
                return setPref(state, PrefName.DEV_MODE, !!action.enabled);
            }

            case ActionType.USER__SET_LAYOUT: {
                return setPref(state, PrefName.LAYOUT, action.layout);
            }

            case ActionType.USER__SET_NAV_COLLAPSED: {
                // noinspection PointlessBooleanExpressionJS
                return setPref(
                    state,
                    PrefName.NAV_COLLAPSED,
                    !!action.collapsed,
                );
            }

            default:
                return state;
        }
    }

    getActivePlan(): Maybe<BfsId> {
        return <BfsId>this.getState().get(PrefName.ACTIVE_PLAN);
    }

    getActiveShoppingPlans(): BfsId[] {
        let plans = <Maybe<Array<BfsId> | string>>(
            this.getState().get(PrefName.ACTIVE_SHOPPING_PLANS)
        );
        if (plans == null || typeof plans === "string" || plans.length === 0) {
            const activePlanId = this.getActivePlan();
            plans = activePlanId != null ? [activePlanId] : [];
        }
        return plans;
    }

    isDevMode() {
        return !!this.getState().get(PrefName.DEV_MODE);
    }

    getLayout(): Layout {
        return <Layout>this.getState().get(PrefName.LAYOUT) ?? "auto";
    }

    isNavCollapsed() {
        return !!this.getState().get(PrefName.NAV_COLLAPSED);
    }
}

export default new PreferencesStore(dispatcher);
