import { ReduceStore } from 'flux/utils'
import Dispatcher from './dispatcher'
import LoadObject from "../util/LoadObject"
import LibraryActions from './LibraryActions'
import LibraryApi from "./LibraryApi"
import hotLoadObject from "../util/hotLoadObject"
import RecipeActions from "./RecipeActions"
import invariant from "invariant"
import dotProp from "dot-prop-immutable"
import {
    addDistinct,
    removeDistinct,
} from "../util/arrayAsSet"

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
            stagedIds: [], // ID[]
        }
    }
    
    reduce(state, action) {
        switch (action.type) {
            
            case LibraryActions.LOAD_LIBRARY:
            case RecipeActions.DISSECTION_RECORDED: {
                LibraryApi.loadLibrary()
                return {
                    ...state,
                    recipeIds: state.recipeIds.loading(),
                }
            }

            case RecipeActions.RECIPE_DELETED: {
                state = dotProp.delete(
                    state,
                    ["byId", action.id]
                )
                state.recipeIds = state.recipeIds.map(ids => {
                    const i = ids.indexOf(action.id)
                    if (i < 0) return ids
                    ids = ids.slice()
                    ids.splice(i, 1)
                    return ids
                })
                return state
            }

            case RecipeActions.CREATE_RECIPE: {
                return dotProp.set(
                    state,
                    ["byId", action.data.id],
                    LoadObject.withValue(action.data).creating(),
                )
            }

            case RecipeActions.RECIPE_CREATED: {
                state = dotProp.set(
                    state,
                    ["byId", action.data.id],
                    LoadObject.withValue(action.data),
                )
                delete state.byId[action.id]
                state.recipeIds = state.recipeIds.map(ids =>
                    ids.concat(action.data.id))
                return state
            }

            case RecipeActions.UPDATE_RECIPE: {
                return dotProp.set(
                    state,
                    ["byId", action.data.id],
                    lo => lo.updating(),
                )
            }

            case RecipeActions.RECIPE_UPDATED: {
                return dotProp.set(
                    state,
                    ["byId", action.id],
                    LoadObject.withValue(action.data).done(),
                )
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

            case LibraryActions.STAGE_RECIPE: {
                const stagedIds = addDistinct(state.stagedIds, action.id)
                if (state.stagedIds === stagedIds) return state
                return {
                    ...state,
                    stagedIds,
                }
            }

            case LibraryActions.UNSTAGE_RECIPE: {
                const stagedIds = removeDistinct(state.stagedIds, action.id)
                if (state.stagedIds === stagedIds) return state
                return {
                    ...state,
                    stagedIds,
                }
            }

            case LibraryActions.UNSTAGE_ALL_RECIPES: {
                if (state.stagedIds.length === 0) return state
                return {
                    ...state,
                    stagedIds: [],
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

    getStagedIds() {
        return this.getState().stagedIds
    }

    getStagedRecipes() {
        return this.getStagedIds()
            .map(id => this.getIngredientById(id))
            .filter(lo => lo.hasValue())
            .map(lo => lo.getValueEnforcing())
    }

    isStaged(id) {
        return this.getState().stagedIds.indexOf(id) >= 0
    }

    getShoppingList() {
        const s = this.getState()
        if (s.stagedIds.length === 0) return LoadObject.empty()
        // i convert an IngredientRef to LoadObject<Map<id, Map<unit, amount>>>
        const raws = []
        const convert = ref => {
            if (!ref.ingredientId) {
                raws.push(ref.raw)
                return LoadObject.withValue({})
            }
            const lo = this.getIngredientById(ref.ingredientId)
            if (!lo.hasValue()) return lo
            const ing = lo.getValueEnforcing()
            if (ing.ingredients == null || ing.ingredients.length === 0) {
                // not an aggregate, and this is how you spell that
                return LoadObject.withValue({
                    [ing.id]: {
                        [ref.units]: ref.quantity || 1,
                    },
                })
            }
            return ing.ingredients
                .map(convert)
                .map(scale(ref))
                .reduce(merge)
        }
        // i scale a LoadObject<Map<id, Map<unit, amount>>> by an IngredientRef
        const scale = ref => lo => lo.map(packet =>
            Object.keys(packet).reduce((im, i) => ({
                ...im,
                [i]: Object.keys(packet[i]).reduce((um, u) => {
                    if (ref.units != null && u !== "null") {
                        console.warn(`Multiplying '${ref.units}' by '${u}', which is weird.`)
                    }
                    return {
                        ...um,
                        [ref.units || u]: packet[i][u] * (ref.quantity || 1),
                    }
                }, {}),
            }), {}))
        // i merge a pair of LoadObject<Map<id, Map<unit, amount>>>
        const merge = (a, b) => {
            if (!a.hasValue()) return a
            if (!b.hasValue()) return b
            return a.map(packet => {
                const result = b.getValueEnforcing()
                Object.keys(packet).forEach(iid => {
                    if (!result.hasOwnProperty(iid)) {
                        result[iid] = packet[iid]
                        return
                    }
                    // gotta merge
                    Object.keys(packet[iid]).forEach(u => {
                        result[iid][u] += packet[iid][u]
                    })
                })
                return result
            })
        }
        // this is a kludge, because currently when staging there is an implicit
        // "1 count" of the recipe. which will have to change, but for now we'll
        // just hard code it so the data structures are right. woo!
        return s.stagedIds
            .map(id => {
                const lo = this.getIngredientById(id)
                return {
                    // an IngredientRef!
                    ingredientId: id,
                    quantity: 1,
                    units: null,
                    raw: lo.hasValue()
                        ? "1 " + lo.getValueEnforcing().name
                        : "staged ing " + id,
                }
            })
            .map(convert)
            .reduce(merge)
            .map(items =>
                Object.keys(items).map(id => {
                    const ing = this.getIngredientById(id).getValueEnforcing()
                    const unitMap = items[id]
                    return Object.keys(unitMap).reduce(
                        (str, u) =>
                            str + ", " + unitMap[u] + (u === "null" ? "" : (" " + u)),
                        ing.name,
                    )
                }).concat(raws))
    }

}

export default new LibraryStore()
