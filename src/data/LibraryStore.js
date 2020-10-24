import { ReduceStore } from "flux/utils";
import invariant from "invariant";
import {
    addDistinct,
    removeDistinct,
} from "../util/arrayAsSet";
import LoadObject from "../util/LoadObject";
import LoadObjectMap from "../util/LoadObjectMap";
import LoadObjectState from "../util/LoadObjectState";
import { fromMilliseconds } from "../util/time";
import Dispatcher from "./dispatcher";
import LibraryActions from "./LibraryActions";
import LibraryApi from "./LibraryApi";
import PantryItemActions from "./PantryItemActions";
import RecipeActions from "./RecipeActions";
import RecipeApi from "./RecipeApi";
import UserStore from "./UserStore";

export const SCOPE_MINE = "mine";
export const SCOPE_EVERYONE = "everyone";
export const LABEL_STAGED_INDICATOR = "--on-stage";

const adaptTime = (recipe) => {
    recipe.totalTime = fromMilliseconds(recipe.totalTime);
    return recipe;
};

const workOnLabels = (state, recipeId, work) => {
    if (!state.byId.has(recipeId)) return state;
    return {
        ...state,
        byId: state.byId.update(recipeId, lo => {
            if (!lo.hasValue()) return lo;
            const r = lo.getValueEnforcing();
            const labels = work(r.labels);
            if (labels === r.labels) return lo;
            return lo.map(r => ({
                ...r,
                labels,
            }));
        }),
    };
};

export const isRecipeStaged = r => {
    if (r == null) return false;
    if (r instanceof LoadObject) {
        if (!r.hasValue()) return false;
        r = r.getValueEnforcing();
    }
    if (r.labels == null) return false;
    return r.labels.indexOf(LABEL_STAGED_INDICATOR) >= 0;
};

class LibraryStore extends ReduceStore {

    getInitialState() {
        return {
            // the real goodies
            byId: new LoadObjectMap(ids =>
                Dispatcher.dispatch({
                    type: LibraryActions.LOAD_INGREDIENTS,
                    ids: [...ids],
                })), // LoadObjectMap<ID, Ingredient>
            // used for bootstrapping (at the moment)
            recipeIds: new LoadObjectState(
                () =>
                    Dispatcher.dispatch({
                        type: LibraryActions.LOAD_LIBRARY
                    })), // LoadObjectState<ID[]>
            scope: SCOPE_MINE,
            filter: ""
        };
    }
    
    reduce(state, action) {
        switch (action.type) {

            case LibraryActions.SET_SCOPE: {
                if (action.scope === state.scope) return state;
                LibraryApi.loadLibrary(action.scope, state.filter);
                return {
                    ...state,
                    scope: action.scope,
                    recipeIds: state.recipeIds.mapLO(lo => lo.loading()),
                };
            }
            
            case LibraryActions.UPDATE_FILTER: {
                return {
                    ...state,
                    filter: action.filter
                };
            }
            
            case LibraryActions.FILTER_LIBRARY: {
                LibraryApi.loadLibrary(state.scope, state.filter);
                return {
                    ...state,
                    recipeIds: state.recipeIds.mapLO(lo => lo.loading()),
                };
            }
            
            case LibraryActions.LOAD_LIBRARY:
            case RecipeActions.DISSECTION_RECORDED: {
                LibraryApi.loadLibrary(state.scope, state.filter);
                return {
                    ...state,
                    recipeIds: state.recipeIds.mapLO(lo => lo.loading()),
                };
            }

            case RecipeActions.RECIPE_DELETED: {
                return {
                    ...state,
                    byId: state.byId.delete(action.id),
                    recipeIds: state.recipeIds.map(ids =>
                        removeDistinct(ids, action.id)),
                };
            }

            case RecipeActions.CREATE_RECIPE: {
                return {
                    ...state,
                    byId: state.byId.set(action.data.id,
                        LoadObject.withValue(action.data).creating()),
                };
            }

            case RecipeActions.RECIPE_CREATED: {
                return {
                    ...state,
                    byId: state.byId
                        .set(action.data.id,
                            LoadObject.withValue(adaptTime(action.data)))
                        .delete(action.id),
                    recipeIds: state.recipeIds.map(ids =>
                        ids.concat(action.data.id))
                };
            }

            case RecipeActions.UPDATE_RECIPE: {
                return {
                    ...state,
                    byId: state.byId.update(action.data.id, lo => lo.updating()),
                };
            }

            case RecipeActions.RECIPE_UPDATED: {
                return {
                    ...state,
                    byId: state.byId.set(action.id,
                        LoadObject.withValue(adaptTime(action.data)).done()),
                };
            }

            case LibraryActions.LOAD_INGREDIENTS: {
                return {
                    ...state,
                    byId: action.ids.reduce((byId, id) => {
                        LibraryApi.getIngredient(id);
                        return byId.set(id, LoadObject.loading());
                    }, state.byId),
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
                    byId: state.byId.set(action.id,
                        LoadObject.withValue(adaptTime(action.data))),
                };
            }
            
            case LibraryActions.LIBRARY_LOADED: {
                return {
                    ...state,
                    recipeIds: state.recipeIds
                        .mapLO(lo => lo.setValue(action.data.map(r => r.id)).done()),
                    byId: action.data.reduce((byId, r) =>
                        byId.set(r.id, LoadObject.withValue(adaptTime(r))), state.byId),
                };
            }

            case LibraryActions.STAGE_RECIPE: {
                RecipeApi.addLabel(action.id, LABEL_STAGED_INDICATOR);
                return workOnLabels(state, action.id, labels =>
                    addDistinct(labels, LABEL_STAGED_INDICATOR));
            }

            case LibraryActions.UNSTAGE_RECIPE: {
                RecipeApi.removeLabel(action.id, LABEL_STAGED_INDICATOR);
                return workOnLabels(state, action.id, labels =>
                    removeDistinct(labels, LABEL_STAGED_INDICATOR));
            }

            case PantryItemActions.ORDER_FOR_STORE: {
                if (!state.byId.has(action.id)) return state;
                const target = state.byId.get(action.targetId);
                if (!target || !target.hasValue()) return state;
                LibraryApi.orderForStore(action.id, action.targetId, action.after);
                return {
                    ...state,
                    byId: state.byId.update(action.id, lo => lo.map(v => ({
                        ...v,
                        storeOrder: target.getValueEnforcing().storeOrder +
                            (action.after ? 0.5 : -0.5)
                    })))
                };
            }

            default: {
                return state;
            }
        }
    }
    
    getLibraryLO() {
        return this.getState()
            .recipeIds
            .getLoadObject()
            .map(ids =>
                ids.map(id =>
                    this.getIngredientById(id).getValueEnforcing()));
    }

    getIngredientById(id) {
        return this.getState()
            .byId
            .get(id);
    }
    
    getRecipeById(selectedRecipe) {
        invariant(
            typeof selectedRecipe === "number",
            "That is not a valid integer",
        );
        return this.getIngredientById(selectedRecipe);
    }

    getStagedRecipes() {
        // don't use the list of recipes, use all recipe ingredients, so it's
        // exempt from filtering.
        const map = this.getState().byId;
        const result = [];
        const me = UserStore.getProfileLO().getValueEnforcing();
        for (const id of map.getKeys()) {
            const lo = map.get(id);
            if (!lo.hasValue()) continue;
            const r = lo.getValueEnforcing();
            if (r.ownerId === me.id && isRecipeStaged(r)) {
                result.push(r);
            }
        }
        return result;
    }

    isStaged(id) {
        return isRecipeStaged(this.getState().byId.get(id));
    }

}

export default new LibraryStore(Dispatcher);
