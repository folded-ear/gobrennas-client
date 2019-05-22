import {OrderedMap, List} from 'immutable';
import {ReduceStore} from 'flux/utils';
import Types from './types';
import Dispatcher from './dispatcher';

import Recipe from '../models/Recipe';
import IngredientRef from "../models/IngredientRef";
import Ingredient from "../models/Ingredient";

class Store extends ReduceStore {
  constructor() {
    super(Dispatcher);
  }
  
  getInitialState() {
    return new OrderedMap({
      library: new List(),
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
      
      default:
        return state;
    }
  }
}

export default new Store();