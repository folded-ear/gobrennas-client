import { OrderedMap } from 'immutable'
import { ReduceStore } from 'flux/utils'
import RecipeActions from './RecipeActions'
import Dispatcher from './dispatcher'
import RecipeApi from "./RecipeApi"
import LoadObject from "../util/LoadObject"
import history from "../util/history"

const buildRecipe = recipe => {
    recipe.type = "Recipe"
    const rawMap = {} // this is a MULTI-map, because there's no guarantee that raw ingredients are unique
    if (recipe.ingredients) {
        recipe.ingredients.forEach(i => {
            if (rawMap.hasOwnProperty(i.raw)) {
                rawMap[i.raw].push(i)
            } else {
                rawMap[i.raw] = [i]
            }
        })
    }
    recipe.ingredients = recipe.rawIngredients
        .split("\n")
        .map(it => it.trim())
        .filter(it => it.length > 0)
        .map(raw => {
            if (rawMap.hasOwnProperty(raw)) {
                const i = rawMap[raw].shift()
                if (rawMap[raw].length === 0) {
                    delete rawMap[raw]
                }
                return i
            } else {
                return { raw }
            }
        })

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