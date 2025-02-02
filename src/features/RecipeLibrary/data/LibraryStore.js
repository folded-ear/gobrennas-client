import Dispatcher from "@/data/dispatcher";
import PantryItemActions from "@/data/PantryItemActions";
import RecipeActions from "@/data/RecipeActions";
import RecipeApi from "@/data/RecipeApi";
import LibraryApi from "@/features/RecipeLibrary/data/LibraryApi";
import { ReduceStore } from "flux/utils";
import PropTypes from "prop-types";
import LoadObject from "@/util/LoadObject";
import LoadObjectMap from "@/util/LoadObjectMap";
import { loadObjectMapOf } from "@/util/loadObjectTypes";
import { fromMilliseconds } from "@/util/time";
import typedStore from "@/util/typedStore";
import LibraryActions from "./LibraryActions";
import { ripLoadObject } from "@/util/ripLoadObject";
import { bfsIdType, ensureString } from "@/global/types/identity";

const adaptTime = (recipe) => {
    if (!recipe.totalTime) return recipe;
    return {
        ...recipe,
        totalTime: fromMilliseconds(recipe.totalTime),
    };
};

class LibraryStore extends ReduceStore {
    getInitialState() {
        return {
            // the real goodies
            byId: new LoadObjectMap((ids) => {
                const stringIdArray = [];
                for (const id of ids) {
                    stringIdArray.push(ensureString(id));
                }
                Dispatcher.dispatch({
                    type: LibraryActions.LOAD_INGREDIENTS,
                    ids: stringIdArray,
                });
            }), // LoadObjectMap<ID, Ingredient>
        };
    }

    reduce(state, action) {
        switch (action.type) {
            case LibraryActions.LOAD_INGREDIENTS: {
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

            case LibraryActions.INGREDIENTS_LOADED: {
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

            case RecipeActions.SEND_TO_PLAN: {
                RecipeApi.sendToPlan(
                    action.recipeId,
                    action.planId,
                    action.scale,
                );
                return state;
            }

            case PantryItemActions.ORDER_FOR_STORE: {
                if (!state.byId.has(action.id)) return state;
                const target = state.byId.get(action.targetId);
                if (!target || !target.hasValue()) return state;
                LibraryApi.orderForStore(
                    action.id,
                    action.targetId,
                    action.after,
                );
                return {
                    ...state,
                    byId: state.byId.update(action.id, (lo) =>
                        lo.map((v) => ({
                            ...v,
                            storeOrder:
                                target.getValueEnforcing().storeOrder +
                                (action.after ? 0.5 : -0.5),
                        })),
                    ),
                };
            }

            default: {
                return state;
            }
        }
    }

    getIngredientById(id) {
        const LOMap = this.getState().byId;
        let lo = LOMap.get(ensureString(id));
        if (lo.isEmpty()) {
            lo = lo.loading();
        }
        return lo;
    }

    getIngredientRloById(id) {
        return ripLoadObject(this.getIngredientById(id));
    }

    getRecipeRloById(id) {
        return ripLoadObject(this.getIngredientById(id));
    }
}

LibraryStore.stateTypes = {
    byId: loadObjectMapOf(
        bfsIdType,
        PropTypes.shape({
            // all
            id: bfsIdType.isRequired,
            type: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            // recipe
            ownerId: bfsIdType,
            externalUrl: PropTypes.string,
            ingredients: PropTypes.arrayOf(
                PropTypes.shape({
                    raw: PropTypes.string.isRequired,
                    quantity: PropTypes.number,
                    units: PropTypes.string,
                    uomId: bfsIdType,
                    ingredient: PropTypes.string,
                    ingredientId: bfsIdType,
                    preparation: PropTypes.string,
                }),
            ),
            directions: PropTypes.string,
            calories: PropTypes.number,
            yield: PropTypes.number,
            totalTime: PropTypes.number,
            labels: PropTypes.arrayOf(PropTypes.string),
            // pantry item
            storeOrder: PropTypes.number,
        }),
    ),
};

export default typedStore(new LibraryStore(Dispatcher));
