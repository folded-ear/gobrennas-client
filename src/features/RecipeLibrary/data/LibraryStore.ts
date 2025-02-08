import dispatcher, { FluxAction } from "@/data/dispatcher";
import RecipeApi from "@/data/RecipeApi";
import LibraryApi from "@/features/RecipeLibrary/data/LibraryApi";
import { ReduceStore } from "flux/utils";
import LoadObject from "@/util/LoadObject";
import LoadObjectMap from "@/util/LoadObjectMap";
import { fromMilliseconds } from "@/util/time";
import { ripLoadObject, RippedLO } from "@/util/ripLoadObject";
import { BfsId, ensureString } from "@/global/types/identity";
import { Ingredient, Recipe } from "@/global/types/types";

export interface SendToPlanPayload {
    recipeId: BfsId;
    planId: BfsId;
    scale?: number;
}

interface State {
    byId: LoadObjectMap<BfsId, Ingredient>;
}

const adaptTime = (recipe) => {
    if (!recipe.totalTime) return recipe;
    return {
        ...recipe,
        totalTime: fromMilliseconds(recipe.totalTime),
    };
};

class LibraryStore extends ReduceStore<State, FluxAction> {
    getInitialState(): State {
        return {
            byId: new LoadObjectMap((ids) => {
                const stringIdArray: string[] = [];
                for (const id of ids) {
                    stringIdArray.push(ensureString(id));
                }
                dispatcher.dispatch({
                    type: "library/load-ingredients",
                    ids: stringIdArray,
                });
            }),
        };
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case "library/load-ingredients": {
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

            case "library/ingredients-loaded": {
                if (action.data.length === 0) {
                    return state;
                }
                return {
                    ...state,
                    byId: action.data.reduce(
                        (byId, it) =>
                            byId.set(
                                ensureString(it.id),
                                LoadObject.withValue(adaptTime(it)),
                            ),
                        state.byId,
                    ),
                };
            }

            case "recipe/send-to-plan": {
                RecipeApi.sendToPlan(
                    action.recipeId,
                    action.planId,
                    action.scale,
                );
                return state;
            }

            case "pantry-item/order-for-store": {
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
        let lo = LOMap.get(ensureString(id));
        if (lo.isEmpty()) {
            lo = lo.loading();
        }
        return lo;
    }

    getIngredientRloById(id: BfsId): RippedLO<Ingredient> {
        return ripLoadObject(this.getIngredientById(id));
    }

    getRecipeRloById(id: BfsId): RippedLO<Recipe> {
        const lo = this.getIngredientById(id);
        if (lo.hasValue() && lo.getValueEnforcing().type !== "Recipe") {
            throw new TypeError(
                "Ingredient '" +
                    id +
                    "' is a " +
                    lo.getValueEnforcing().type +
                    " not a Recipe",
            );
        }
        return ripLoadObject(lo as LoadObject<Recipe>);
    }
}

export default new LibraryStore(dispatcher);
