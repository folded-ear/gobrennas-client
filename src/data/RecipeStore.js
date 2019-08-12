import { OrderedMap } from 'immutable'
import { ReduceStore } from 'flux/utils'
import RecipeActions from './RecipeActions'
import Dispatcher from './dispatcher'
import RecipeApi from "./RecipeApi"
import LoadObject from "../util/LoadObject"
import history from "../util/history"

export const buildRecipe = recipe => {
    recipe.type = "Recipe"
    delete recipe.rawIngredients
    return recipe
}

class RecipeStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher)
    }
    
    getInitialState() {
        return new OrderedMap({
            sendState: null,
        })
    }
    
    reduce(state, action) {
        switch (action.type) {
            
            case RecipeActions.CREATE_RECIPE: {
                RecipeApi.addRecipe(buildRecipe(action.data))
                return state
            }
            
            case RecipeActions.UPDATE_RECIPE: {
                RecipeApi.updateRecipe(buildRecipe(action.data))
                return state
            }

            case RecipeActions.RECIPE_DELETED: {
                history.push("/library")
                return state
            }
            
            case RecipeActions.ASSEMBLE_SHOPPING_LIST: {
                RecipeApi.assembleShoppingList(
                    action.recipeIds,
                    action.listId,
                )
                return state.set("sendState", LoadObject.updating())
            }
            
            case RecipeActions.SHOPPING_LIST_ASSEMBLED: {
                return state.set("sendState", LoadObject.empty())
            }

            case RecipeActions.RAW_INGREDIENT_DISSECTED: {
                RecipeApi.recordIngredientDissection(
                    action.raw,
                    action.quantity,
                    action.units,
                    action.name,
                    action.prep,
                )
                return state
            }
            
            default:
                return state
        }
    }
    
    getSendState() {
        return this.getState().get("sendState")
    }

}

export default new RecipeStore()