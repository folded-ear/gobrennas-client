import Dispatcher from "@/data/dispatcher";
import PantryItemActions from "@/data/PantryItemActions";
import RecipeActions from "@/data/RecipeActions";
import RecipeApi from "@/data/RecipeApi";
import LibraryApi from "@/features/RecipeLibrary/data/LibraryApi";
import { ReduceStore } from "flux/utils";
import invariant from "invariant";
import PropTypes from "prop-types";
import { clientOrDatabaseIdType } from "@/util/ClientId";
import LoadObject from "@/util/LoadObject";
import LoadObjectMap from "@/util/LoadObjectMap";
import { loadObjectMapOf } from "@/util/loadObjectTypes";
import { fromMilliseconds } from "@/util/time";
import typedStore from "@/util/typedStore";
import LibraryActions from "./LibraryActions";
import { ripLoadObject } from "@/util/ripLoadObject";

export const adaptTime = (recipe) => {
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
            byId: new LoadObjectMap((ids) =>
                Dispatcher.dispatch({
                    type: LibraryActions.LOAD_INGREDIENTS,
                    ids: [...ids],
                }),
            ), // LoadObjectMap<ID, Ingredient>
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

            case LibraryActions.INGREDIENT_LOADED: {
                if (action.background && !state.byId.has(action.id)) {
                    // background update to something we don't have info about,
                    // so just ignore it.
                    return state;
                }
                return {
                    ...state,
                    byId: state.byId.set(
                        action.id,
                        LoadObject.withValue(adaptTime(action.data)),
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
                                it.id,
                                LoadObject.withValue(adaptTime(it)),
                            ),
                        state.byId,
                    ),
                };
            }

            case RecipeActions.SEND_TO_PLAN: {
                RecipeApi.sendToPlan(
                    typeof action.recipeId === "string"
                        ? parseInt(action.recipeId)
                        : action.recipeId,
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
        let lo = LOMap.get(id);
        if (lo.isEmpty()) {
            lo = lo.loading();
        }
        return lo;
    }

    getIngredientRloById(id) {
        return ripLoadObject(this.getIngredientById(id));
    }

    getRecipeRloById(id) {
        invariant(typeof id === "number", "That is not a valid integer");
        return ripLoadObject(this.getIngredientById(id));
    }
}

LibraryStore.stateTypes = {
    byId: loadObjectMapOf(
        clientOrDatabaseIdType,
        PropTypes.shape({
            // all
            id: clientOrDatabaseIdType.isRequired,
            type: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            // recipe
            ownerId: clientOrDatabaseIdType,
            externalUrl: PropTypes.string,
            ingredients: PropTypes.arrayOf(
                PropTypes.shape({
                    raw: PropTypes.string.isRequired,
                    quantity: PropTypes.number,
                    units: PropTypes.string,
                    uomId: PropTypes.number,
                    ingredient: PropTypes.string,
                    ingredientId: PropTypes.number,
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
