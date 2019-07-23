import { ReduceStore } from "flux/utils"
import Dispatcher from "./dispatcher"
import RecipeActions from "./RecipeActions"
import RouteActions from "./RouteActions"
import LibraryActions from "./LibraryActions"
import LibraryStore from "./LibraryStore"
import LoadObject from "../util/LoadObject"
import ClientId from "../util/ClientId"
import history from "../util/history"

const loadRecipeIfPossible = draftLO => {
    if (draftLO.isDone()) return draftLO
    const state = draftLO.getValueEnforcing()
    if (!state.id) return draftLO
    const lo = LibraryStore.getRecipeById(state.id)
    if (!lo.hasValue()) return draftLO
    const recipe = lo.getValueEnforcing()
    return draftLO.setValue({
        ...state,
        ...recipe,
        rawIngredients: recipe.ingredients
            .map(item => item.raw)
            .join("\n"),
    }).done()
}

class DraftRecipeStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher)
    }
    
    getInitialState() {
        return LoadObject.withValue({
            id: ClientId.next(),
        })
    }
    
    reduce(state, action) {
        
        switch (action.type) {

            case RouteActions.MATCH: {
                const match = action.match
                switch (match.path) {
                    case "/library/recipe/:id/edit": {
                        state = state.setValue({
                            id: parseInt(match.params.id),
                        }).loading()
                        return loadRecipeIfPossible(state)
                    }

                    case "/add": {
                        return this.getInitialState()
                    }

                    default:
                        return state
                }
            }

            case LibraryActions.INGREDIENT_LOADED:
            case LibraryActions.LIBRARY_LOADED: {
                Dispatcher.waitFor([
                    LibraryStore.getDispatchToken(),
                ])
                return loadRecipeIfPossible(state)
            }

            case RecipeActions.DRAFT_RECIPE_UPDATED: {
                let {key, value} = action.data
                return state.map(s => ({
                    ...s,
                    [key]: value,
                }))
            }

            case RecipeActions.CREATE_RECIPE: {
                return state.creating()
            }

            case RecipeActions.UPDATE_RECIPE: {
                return state.updating()
            }

            case RecipeActions.RECIPE_CREATED: {
                return this.getInitialState()
            }

            case RecipeActions.CANCEL_ADD: {
                history.push("/library")
                return this.getInitialState()
            }

            case RecipeActions.CANCEL_EDIT: {
                history.push(`/library/recipe/${action.id}`)
                return this.getInitialState()
            }

            case RecipeActions.RECIPE_UPDATED: {
                return state.done()
            }

            default:
                return state
        }
    }

    getDraftLO() {
        return this.getState()
    }

    getDraft() {
        return this.getState().getValueEnforcing()
    }
    
}

export default new DraftRecipeStore()