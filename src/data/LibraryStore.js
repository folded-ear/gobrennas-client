import { ReduceStore } from 'flux/utils'
import Dispatcher from './dispatcher'
import { OrderedMap } from "immutable"
import LoadObject from "../util/LoadObject"
import LibraryActions from './LibraryActions'
import LibraryApi from "./LibraryApi"
import hotLoadObject from "../util/hotLoadObject"
import RecipeActions from "./RecipeActions"
import invariant from "invariant"

class LibraryStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher)
    }
    
    getInitialState() {
        return new OrderedMap({
            recipes: LoadObject.empty() // LoadObject<Array<Recipe>
        })
    }
    
    reduce(state, action) {
        switch (action.type) {
            
            case LibraryActions.LOAD_LIBRARY:
            case RecipeActions.RECIPE_CREATED:
            case RecipeActions.RECIPE_UPDATED:
            case RecipeActions.RECIPE_DELETED:
            case RecipeActions.DISSECTION_RECORDED: {
                LibraryApi.loadLibrary()
                return state.set('recipes', state.get('recipes').loading())
            }
            
            case LibraryActions.LIBRARY_LOADED: {
                return state.set('recipes', state.get('recipes').done().setValue(action.data))
            }
            
            default: {
                return state
            }
        }
    }
    
    getLibraryLO() {
        return hotLoadObject(
            () => this.getState().get('recipes'),
            () =>
                Dispatcher.dispatch({
                    type: LibraryActions.LOAD_LIBRARY
                })
        )
    }

    getIngredientById(id) {
        // for now...
        return this.getRecipeById(id)
    }
    
    getRecipeById(selectedRecipe) {
        invariant(
            typeof selectedRecipe === "number",
            "That is not a valid integer",
        )

        const lo = this.getLibraryLO()
        if(lo.hasValue()) {
            const recipe = lo.getValueEnforcing().find( recipe => recipe.id === selectedRecipe)
            return recipe != null ? LoadObject.withValue(recipe) : LoadObject.empty()
        }
        return lo
    }
}

export default new LibraryStore()