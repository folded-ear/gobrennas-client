import { ReduceStore } from 'flux/utils'
import Dispatcher from './dispatcher'
import LoadObject from "../util/LoadObject"
import LibraryActions from './LibraryActions'
import LibraryApi from "./LibraryApi"
import hotLoadObject from "../util/hotLoadObject"
import RecipeActions from "./RecipeActions"
import invariant from "invariant"
import dotProp from "dot-prop-immutable"

class LibraryStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher)
    }
    
    getInitialState() {
        return {
            // the real goodies
            byId: {}, // Map<ID, LoadObject<Ingredient>>
            // used for bootstrapping (at the moment)
            recipeIds: LoadObject.empty(), // LoadObject<ID[]>
        }
    }
    
    reduce(state, action) {
        switch (action.type) {
            
            case LibraryActions.LOAD_LIBRARY:
            case RecipeActions.RECIPE_CREATED:
            case RecipeActions.RECIPE_UPDATED:
            case RecipeActions.RECIPE_DELETED:
            case RecipeActions.DISSECTION_RECORDED: {
                LibraryApi.loadLibrary()
                return {
                    ...state,
                    recipeIds: state.recipeIds.loading(),
                }
            }

            case LibraryActions.LOAD_INGREDIENT: {
                LibraryApi.getIngredient(action.id)
                return dotProp.set(state, ["byId", action.id], lo =>
                    lo instanceof LoadObject
                        ? lo.loading()
                        : LoadObject.loading())
            }

            case LibraryActions.INGREDIENT_LOADED: {
                return dotProp.set(
                    state,
                    ["byId", action.id],
                    LoadObject.withValue(action.data),
                )
            }
            
            case LibraryActions.LIBRARY_LOADED: {
                return {
                    ...state,
                    recipeIds: LoadObject.withValue(action.data.map(r => r.id)),
                    // use the "pure function implemented with mutable local state" methodology
                    byId: action.data.reduce((idx, r) => {
                        idx[r.id] = LoadObject.withValue(r)
                        return idx
                    }, state.byId),
                }
            }

            default: {
                return state
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
                this.getIngredientById(id).getValueEnforcing()))
    }

    getIngredientById(id) {
        return hotLoadObject(
            () => this.getState().byId[id],
            () =>
                Dispatcher.dispatch({
                    type: LibraryActions.LOAD_INGREDIENT,
                    id,
                })
        )
    }
    
    getRecipeById(selectedRecipe) {
        invariant(
            typeof selectedRecipe === "number",
            "That is not a valid integer",
        )
        return this.getIngredientById(selectedRecipe)
    }
}

export default new LibraryStore()
