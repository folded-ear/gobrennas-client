import dotProp from "dot-prop-immutable";
import { ReduceStore } from "flux/utils";
import invariant from "invariant";
import {
    addDistinct,
    removeDistinct,
} from "../util/arrayAsSet";
import hotLoadObject from "../util/hotLoadObject";
import LoadObject from "../util/LoadObject";
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
    const lo = state.byId[recipeId];
    if (lo == null || !lo.hasValue()) return state;
    const r = lo.getValueEnforcing();
    const labels = work(r.labels);
    if (labels === r.labels) return state;
    return dotProp.set(state, ["byId", recipeId], lo =>
        lo.map(r => ({
            ...r,
            labels,
        })));
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
            byId: {}, // Map<ID, LoadObject<Ingredient>>
            // used for bootstrapping (at the moment)
            recipeIds: LoadObject.empty(), // LoadObject<ID[]>
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
                    recipeIds: LoadObject.loading(),
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
                    recipeIds: LoadObject.loading(),
                };
            }
            
            case LibraryActions.LOAD_LIBRARY:
            case RecipeActions.DISSECTION_RECORDED: {
                LibraryApi.loadLibrary(state.scope, state.filter);
                return {
                    ...state,
                    recipeIds: state.recipeIds.loading(),
                };
            }

            case RecipeActions.RECIPE_DELETED: {
                state = dotProp.delete(
                    state,
                    ["byId", action.id]
                );
                state.recipeIds = state.recipeIds.map(ids => {
                    const i = ids.indexOf(action.id);
                    if (i < 0) return ids;
                    ids = ids.slice();
                    ids.splice(i, 1);
                    return ids;
                });
                return state;
            }

            case RecipeActions.CREATE_RECIPE: {
                return dotProp.set(
                    state,
                    ["byId", action.data.id],
                    LoadObject.withValue(action.data).creating(),
                );
            }

            case RecipeActions.RECIPE_CREATED: {
                state = dotProp.set(
                    state,
                    ["byId", action.data.id],
                    LoadObject.withValue(adaptTime(action.data)),
                );
                delete state.byId[action.id];
                state.recipeIds = state.recipeIds.map(ids =>
                    ids.concat(action.data.id));
                return state;
            }

            case RecipeActions.UPDATE_RECIPE: {
                return dotProp.set(
                    state,
                    ["byId", action.data.id],
                    lo => lo.updating(),
                );
            }

            case RecipeActions.RECIPE_UPDATED: {
                return dotProp.set(
                    state,
                    ["byId", action.id],
                    LoadObject.withValue(adaptTime(action.data)).done(),
                );
            }

            case LibraryActions.LOAD_INGREDIENT: {
                LibraryApi.getIngredient(action.id);
                return dotProp.set(state, ["byId", action.id], lo =>
                    lo instanceof LoadObject
                        ? lo.loading()
                        : LoadObject.loading());
            }

            case LibraryActions.INGREDIENT_LOADED: {
                if (action.background && !state.byId.hasOwnProperty(action.id)) {
                    // background update to something we don't have info about,
                    // so just ignore it.
                    return state;
                }
                return dotProp.set(
                    state,
                    ["byId", action.id],
                    LoadObject.withValue(adaptTime(action.data)),
                );
            }
            
            case LibraryActions.LIBRARY_LOADED: {
                return {
                    ...state,
                    recipeIds: LoadObject.withValue(action.data.map(r => r.id)),
                    // use the "pure function implemented with mutable local state" methodology
                    byId: action.data.reduce((idx, r) => {
                        idx[r.id] = LoadObject.withValue(adaptTime(r));
                        return idx;
                    }, state.byId),
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
                const it = state.byId[action.id];
                if (!it || !it.hasValue()) return state;
                const target = state.byId[action.targetId];
                if (!target || !target.hasValue()) return state;
                LibraryApi.orderForStore(action.id, action.targetId, action.after);
                return dotProp.set(state, ["byId", action.id], it.map(v => ({
                    ...v,
                    storeOrder: target.getValueEnforcing().storeOrder +
                        (action.after ? 0.5 : -0.5)
                })));
            }

            default: {
                return state;
            }
        }
    }
    
    getLibraryLO() {
        return hotLoadObject(
            () => this.getState().recipeIds,
            () =>
                Dispatcher.dispatch({
                    type: LibraryActions.LOAD_LIBRARY
                })
        ).map(ids =>
            ids.map(id =>
                this.getIngredientById(id).getValueEnforcing()));
    }

    getIngredientById(id) {
        return hotLoadObject(
            () => this.getState().byId[id],
            () =>
                Dispatcher.dispatch({
                    type: LibraryActions.LOAD_INGREDIENT,
                    id,
                })
        );
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
        for (const id of Object.keys(map)) {
            const lo = map[id];
            if (!lo.hasValue()) continue;
            const r = lo.getValueEnforcing();
            if (r.ownerId === me.id && isRecipeStaged(r)) {
                result.push(r);
            }
        }
        return result;
    }

    isStaged(id) {
        return isRecipeStaged(this.getState().byId[id]);
    }

}

export default new LibraryStore(Dispatcher);
