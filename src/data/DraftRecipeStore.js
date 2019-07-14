import { ReduceStore } from 'flux/utils'
import Dispatcher from './dispatcher'
import LoadObject from "../util/LoadObject"
import hotLoadObject from "../util/hotLoadObject"
import RecipeActions from "./RecipeActions"
import Recipe from "../models/Recipe"

class DraftRecipeStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher)
    }
    
    getInitialState() {
        return LoadObject.empty()
    }
    
    reduce(state, action) {
        
        //TODO: This seems to mostly work (ish) although it's more convoluted than it needs to be. Refactoring is definitely in order.
        
        switch (action.type) {
            case RecipeActions.LOAD_EMPTY_RECIPE: {
                return state.setValue(new Recipe()).creating()
            }
    
            case RecipeActions.LOAD_RECIPE_DRAFT: {
                const recipe = new Recipe(action.data)
                    .set("rawIngredients", action.data.ingredients.map(item => item.raw).join("\n"))
                return state.setValue(recipe).updating()
            }
            
            case RecipeActions.DRAFT_RECIPE_UPDATED: {
                let {key, value} = action.data
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
                    draft.set(key, value)).updating()
            }
            
            case RecipeActions.RECIPE_CREATED: {
                return this.getInitialState()
            }
            
            default:
                return state
        }
    }
    
    getDraftRecipeLO() {
        return hotLoadObject(
            () => this.getState(),
            () => Dispatcher.dispatch({
                type: RecipeActions.LOAD_EMPTY_RECIPE,
            }),
        )
    }
    
    shouldLoadDraft(id) {
        return !this.getDraftRecipeLO().hasValue() || !this.getDraftRecipeLO().getValueEnforcing().id === id
    }
}

export default new DraftRecipeStore()