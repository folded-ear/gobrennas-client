import { ReduceStore } from 'flux/utils'
import Dispatcher from './dispatcher';
import LoadObject from "../util/LoadObject";
import hotLoadObject from "../util/hotLoadObject";
import RecipeActions from "./RecipeActions";
import RecipeApi from "./RecipeApi";
import Recipe from "../models/Recipe";

class DraftRecipeStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher);
    }
    
    getInitialState() {
        return LoadObject.empty();
    }
    
    reduce(state, action) {
        switch (action.type) {
            case RecipeActions.LOAD_DRAFT_RECIPE: {
                return state.setValue(new Recipe()).creating();
            }
            
            case RecipeActions.DRAFT_RECIPE_UPDATED: {
                let {key, value} = action.data;
                if (key === "rawIngredients") {
                    state = state.map(draft =>
                        draft.set("ingredients", value
                            .split("\n")
                            .map(it => it.trim())
                            .filter(it => it.length > 0)
                            // since this a Recipe, these should be IngredientRef, but
                            // `RecipeApi.addRecipe` assume they aren't.
                            .map(raw => ({raw}))))
                }
                return state.map(draft =>
                    draft.set(key, value)).updating();
            }
            
            case RecipeActions.SAVE_DRAFT_RECIPE: {
                RecipeApi.addRecipe(state.getValueEnforcing());
                return state.updating();
            }

            case RecipeActions.RECIPE_CREATED: {
                return state.done();
            }
            
            default:
                return state;
        }
    }
    
    getDraftRecipeLO() {
        return hotLoadObject(
            () => this.getState(),
            () => Dispatcher.dispatch({
                type: RecipeActions.LOAD_DRAFT_RECIPE,
            }),
        );
    }
}

export default new DraftRecipeStore();