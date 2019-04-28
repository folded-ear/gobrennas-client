import { OrderedMap, List } from 'immutable';
import {ReduceStore} from 'flux/utils';
import Types from './types';
import Dispatcher from './dispatcher';

import Recipe from '../models/Recipe';

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
        let recipes = List(action.data.map( recipe => {
          return ( new Recipe({
            id: recipe.id,
            title: recipe.title,
            external_url: recipe.external_url,
            ingredients: recipe.ingredients,
            directions: recipe.directions
          }))
        }));
  
        return state.setIn(['library'], recipes);
      }
      
      case Types.ADD_RECIPE: {
        if (!action.data) { return state; }
        return state.get('library').push(action.data);
      }
      
      case Types.SELECT_RECIPE: {
        return state.set('selected', action.id)
      }
      
      case Types.DELETE_RECIPE: {
        return state
          .set('selected', null)
          .deleteIn(['library', action.id]);
      }
      
      default:
        return state;
    }
  }
}

export default new Store();