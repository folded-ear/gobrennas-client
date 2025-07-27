import dispatcher, { ActionType, FluxAction } from "@/data/dispatcher";
import RecipeApi from "@/data/RecipeApi";
import LibraryApi from "@/features/RecipeLibrary/data/LibraryApi";
import { BfsId } from "@/global/types/identity";
import { Ingredient } from "@/global/types/types";
import LoadObject from "@/util/LoadObject";
import LoadObjectMap from "@/util/LoadObjectMap";
import { ripLoadObject, RippedLO } from "@/util/ripLoadObject";
import { ReduceStore } from "flux/utils";

export interface SendToPlanPayload {
    recipeId: BfsId;
    planId: BfsId;
    scale?: number;
}

interface State {
    byId: LoadObjectMap<BfsId, Ingredient>;
}

class LibraryStore extends ReduceStore<State, FluxAction> {
    getInitialState(): State {
        return {
            byId: new LoadObjectMap((ids) => {
                dispatcher.dispatch({
                    type: ActionType.LIBRARY__LOAD_INGREDIENTS,
                    ids: [...ids],
                });
            }),
        };
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case ActionType.LIBRARY__LOAD_INGREDIENTS: {
                if (action.ids.length === 0) {
                    return state;
                }
                LibraryApi.getIngredientInBulk(action.ids);
                return {
                    ...state,
                    byId: action.ids.reduce(
                        (byId, id) => byId.set(id, LoadObject.loading()),
                        state.byId,
                    ),
                };
            }

            case ActionType.LIBRARY__INGREDIENTS_LOADED: {
                if (action.data.length === 0) {
                    return state;
                }
                return {
                    ...state,
                    byId: action.data.reduce(
                        (byId, it) => byId.set(it.id, LoadObject.withValue(it)),
                        state.byId,
                    ),
                };
            }

            case ActionType.RECIPE__SEND_TO_PLAN: {
                RecipeApi.sendToPlan(
                    action.recipeId,
                    action.planId,
                    action.scale,
                );
                return state;
            }

            case ActionType.PANTRY_ITEM__ORDER_FOR_STORE: {
                const target = state.byId.get(action.targetId);
                if (!target || !target.hasValue()) return state;
                const tgt = target.getValueEnforcing();
                if (tgt.type !== "PantryItem") return state;
                LibraryApi.orderForStore(
                    action.id,
                    action.targetId,
                    action.after,
                );
                return {
                    ...state,
                    byId: state.byId.update(action.id, (lo) => {
                        return lo.map((v) => ({
                            ...v,
                            storeOrder:
                                tgt.storeOrder + (action.after ? 0.5 : -0.5),
                        }));
                    }),
                };
            }

            default: {
                return state;
            }
        }
    }

    getIngredientById(id: BfsId): LoadObject<Ingredient> {
        const LOMap = this.getState().byId;
        let lo = LOMap.get(id);
        if (lo.isEmpty()) {
            lo = lo.loading();
        }
        return lo;
    }

    getIngredientRloById(id: BfsId): RippedLO<Ingredient> {
        return ripLoadObject(this.getIngredientById(id));
    }
}

export default new LibraryStore(dispatcher);
