import { ReduceStore } from 'flux/utils'
import Dispatcher from './dispatcher'
import RecipeActions from "./RecipeActions"

class DraftRecipeStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher)
    }
    
    getInitialState() {
        return {
            id: null
        }
    }
    
    reduce(state, action) {
        
        //TODO: This seems to mostly work (ish) although it's more convoluted than it needs to be. Refactoring is definitely in order.
        
        switch (action.type) {
    
            case RecipeActions.LOAD_RECIPE_DRAFT: {
                const recipe = action.data
                recipe.rawIngredients = action.data.ingredients.map(item => item.raw).join("\n")
                return {
                    ...state,
                    ...recipe
                }
            }
            
            case RecipeActions.DRAFT_RECIPE_UPDATED: {
                let {key, value} = action.data
                return {
                    ...state,
                    [key]: value
                }
            }
            
            case RecipeActions.RECIPE_CREATED: {
                return this.getInitialState()
            }
            
            default:
                return state
        }
    }
    
    getDraft() {
        return this.getState()
    }
    
    shouldLoadDraft(id) {
        return this.getState().id == null || this.getState().id !== id
    }
}

export default new DraftRecipeStore()