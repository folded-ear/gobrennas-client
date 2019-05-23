import {OrderedMap, List} from 'immutable';
import {ReduceStore} from 'flux/utils';
import Types from './types';
import Dispatcher from './dispatcher';

import Recipe from '../models/Recipe';
import IngredientRef from "../models/IngredientRef";
import Ingredient from "../models/Ingredient";
import PantryItem from "../models/PantryItem";

class Store extends ReduceStore {
  constructor() {
    super(Dispatcher);
  }
  
  getInitialState() {
    return new OrderedMap({
      library: new List(),
      pantry_items: new List(),
      selected: null
    });
  }
  
  reduce(state, action) {
    switch (action.type) {
      
      case Types.FETCH_RECIPES: {
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
            directions: recipe.directions
          }))
        }));
        
        return state.setIn(['library'], recipes);
      }
      
      case Types.ADD_RECIPE: {
        if (!action.data) {
          return state;
        }
        return state.set('library', state.get('library').push(action.data));
      }
      
      case Types.SELECT_RECIPE: {
        return state.set('selected', action.id)
      }
      
      case Types.DELETE_RECIPE: {
        const index = state.get('library').findIndex(recipe => recipe.get('id') === action.id);
        
        if (index >= 0) {
          return state
            .set('selected', null)
            .set('library', state.get('library').remove(index));
        }
        return state;
      }
      
      case Types.FETCH_PANTRYITEMS: {
        let items = List(action.data.map( item => {
          return (new PantryItem({
            id: item.ingredientId,
            name: item.name,
            aisle: item.aisle
          }))
        }));
  
        return state.setIn(['pantry_items'], items);
      }
      
      case Types.ADD_PANTRYITEM: {
        if(!action.data) {
          return state;
        }
        return state.set('pantry_items', state.get('pantry_items').push(action.data))
      }
      
      default:
        return state;
    }
  }
}

export default new Store();