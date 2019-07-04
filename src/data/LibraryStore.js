import {ReduceStore} from 'flux/utils'
import Dispatcher from './dispatcher'
import {
    List,
    OrderedMap
} from "immutable";
import LoadObject from "../util/LoadObject";
import Recipe from "../models/Recipe";
import LibraryActions from './LibraryActions'
import IngredientRef from "../models/IngredientRef";
import Ingredient from "../models/Ingredient";
import LibraryApi from "./LibraryApi";

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
        
        switch(action.type) {
    
            case LibraryActions.LOAD_LIBRARY: {
                return this.loadLibrary(state)
            }
                
            case LibraryActions.LIBRARY_LOADED: {
                let recipes = List(action.data.map(recipe => {
                    return (new Recipe({
                        id: recipe.ingredientId,
                        title: recipe.title,
                        external_url: recipe.external_url,
                        ingredients: recipe.ingredients.map(ingredient => {
                            return new IngredientRef({
                                id: ingredient.ingredientId,
                                quantity: ingredient.quantity,
                                preparation: ingredient.preparation,
                                ingredient: new Ingredient({
                                    name: ingredient.ingredient.name
                                })
                            })
                        }),
                        rawIngredients: recipe.rawIngredients,
                        directions: recipe.directions
                    }))
                }));
        
                return state.setIn(['library'], recipes);
            }
    
            default: {
                return state
            }
        }
    }
    
    loadLibrary(state) {
        const lo = state.get('recipes');
        
        if (lo.isLoading()) {
            return state
        }
        LibraryApi.loadLibrary();
        return state.set('recipes', lo.loading());
    }
    
    getLibraryLO() {
        const s = this.getState();
        return s.get('recipes');
    }
}

export default new LibraryStore()