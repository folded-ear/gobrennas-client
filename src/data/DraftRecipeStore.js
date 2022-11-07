import dotProp from "dot-prop-immutable";
import { ReduceStore } from "flux/utils";
import ClientId from "util/ClientId";
import history from "util/history";
import LoadObject from "util/LoadObject";
import { toMilliseconds } from "util/time";
import Dispatcher from "./dispatcher";
import LibraryActions from "features/RecipeLibrary/data/LibraryActions";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import RecipeActions from "./RecipeActions";
import RecipeApi from "./RecipeApi";
import RouteActions from "./RouteActions";

const buildTemplate = () => ({
    id: ClientId.next(),
    name: "",
    externalUrl: "",
    ingredients: [{raw: ""}],
    directions: "",
    "yield": null,
    totalTime: null,
    calories: null,
    labels: []
});

const buildWirePacket = recipe => {
    recipe.type = "Recipe";
    recipe.totalTime = toMilliseconds(recipe.totalTime);
    delete recipe.rawIngredients;
    return recipe;
};

const loadRecipeIfPossible = draftLO => {
    if (draftLO.isDone()) return draftLO;
    const state = draftLO.getValueEnforcing();
    if (!state.id) return draftLO;
    const lo = LibraryStore.getRecipeById(state.sourceId || state.id);
    if (!lo.hasValue()) return draftLO;
    const recipe = lo.getValueEnforcing();
    return draftLO.setValue({
        ...buildTemplate(),
        ...state,
        ...recipe,
        id: state.id, // in case it's a copy
    }).done().map(s => {
        if (s.ingredients == null || s.ingredients.length === 0) {
            s = {
                ...s,
                ingredients: [{raw: ""}]
            };
        }
        return s;
    });
};

class DraftRecipeStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher);
    }
    
    getInitialState() {
        return LoadObject.withValue(buildTemplate());
    }
    
    reduce(state, action) {
        
        switch (action.type) {

            case RouteActions.MATCH: {
                const match = action.match;
                switch (match.path) {
                    case "/library/recipe/:id/edit": {
                        state = state.setValue({
                            id: parseInt(match.params.id),
                        }).loading();
                        return loadRecipeIfPossible(state);
                    }

                    case "/library/recipe/:id/make-copy": {
                        state = state.setValue({
                            id: ClientId.next(),
                            sourceId: parseInt(match.params.id),
                        }).loading();
                        return loadRecipeIfPossible(state);
                    }

                    case "/add": {
                        return this.getInitialState();
                    }

                    default:
                        return state;
                }
            }

            case LibraryActions.INGREDIENT_LOADED:
            case LibraryActions.INGREDIENTS_LOADED:
            case LibraryActions.SEARCH_LOADED: {
                Dispatcher.waitFor([
                    LibraryStore.getDispatchToken(),
                ]);
                return loadRecipeIfPossible(state);
            }

            case RecipeActions.DRAFT_RECIPE_UPDATED: {
                let {key, value} = action.data;
                state = state.map(s => dotProp.set(s, key, value));
                return state;
            }
    
            case RecipeActions.NEW_DRAFT_LABEL: {
                state = state.map( s => dotProp.set(s, "labels", s.labels.concat([action.data])));
                return state;
            }
            
            case RecipeActions.REMOVE_DRAFT_LABEL: {
                const { index } = action.data;
                state = state.map( s => dotProp.delete(s, `labels.${index}`));
                return state;
            }

            case RecipeActions.NEW_DRAFT_INGREDIENT_YO: {
                return state.map(s => {
                    const ing = {
                        raw: "",
                    };
                    const ingredients = s.ingredients == null
                        ? []
                        : s.ingredients.slice(0);
                    const idx = action.hasOwnProperty("index")
                        ? action.index
                        : ingredients.length;
                    if (idx < 0 || idx >= ingredients.length) {
                        ingredients.push(ing);
                    } else {
                        ingredients.splice(idx + 1, 0, ing);
                    }
                    return {
                        ...s,
                        ingredients,
                    };
                });
            }

            case RecipeActions.KILL_DRAFT_INGREDIENT_YO: {
                return state.map(s => {
                    if (s.ingredients == null) return s;
                    const idx = action.index;
                    if (idx == null || idx < 0) return s;
                    if (idx >= s.ingredients.length) return s;
                    const ingredients = s.ingredients.slice(0);
                    ingredients.splice(idx, 1);
                    return {
                        ...s,
                        ingredients,
                    };
                });
            }

            case RecipeActions.MULTI_LINE_DRAFT_INGREDIENT_PASTE_YO: {
                return state.map(s => {
                    const ingredients = s.ingredients == null
                        ? []
                        : s.ingredients.slice(0);
                    let idx = action.index < 0
                        ? 0
                        : action.index < ingredients.length
                            ? action.index
                            : ingredients.length - 1;
                    if (ingredients[idx].raw.length === 0) {
                        // if pasting into an empty on, delete it
                        ingredients.splice(idx--, 1);
                    }
                    action.text
                        .split("\n")
                        .map(it => it.trim())
                        .filter(it => it.length > 0)
                        .forEach(raw =>
                            ingredients.splice(++idx, 0, {raw}));
                    return {
                        ...s,
                        ingredients,
                    };
                });
            }

            case RecipeActions.CREATE_RECIPE: {
                RecipeApi.addRecipe(buildWirePacket(action.data));
                return state.creating();
            }

            case RecipeActions.UPDATE_RECIPE: {
                RecipeApi.updateRecipe(buildWirePacket(action.data));
                return state.updating();
            }

            case RecipeActions.RECIPE_CREATED: {
                history.push(`/library/recipe/${action.data.id}`);
                return this.getInitialState();
            }

            case RecipeActions.RECIPE_UPDATED: {
                if (state.hasValue() && action.data.id === state.getValueEnforcing().id) {
                    history.push(`/library/recipe/${action.data.id}`);
                }
                return this.getInitialState();
            }

            case RecipeActions.CANCEL_ADD: {
                history.push(action.sourceId == null
                    ? "/library"
                    : `/library/recipe/${action.sourceId}`);
                return this.getInitialState();
            }

            case RecipeActions.CANCEL_EDIT: {
                history.push(`/library/recipe/${action.id}`);
                return this.getInitialState();
            }

            default:
                return state;
        }
    }

    getDraftLO() {
        return this.getState();
    }

    getDraft() {
        return this.getState().getValueEnforcing();
    }
    
}

export default new DraftRecipeStore();
