import { List } from 'immutable';
import {ReduceStore} from 'flux/utils';
import Types from './types';
import Dispatcher from './dispatcher';

import Counter from './Counter';
import Recipe from './Recipe';

class Store extends ReduceStore {
  constructor() {
    super(Dispatcher);
  }
  
  getInitialState() {
    return new List();
  }
  
  reduce(state, action) {
    switch (action.type) {
      
      case Types.FETCH_RECIPES:
        let recipes = List(action.data.map( recipe => {
          return ( new Recipe({
            id: recipe.id,
            title: recipe.title,
            external_url: recipe.external_url,
            ingredients: recipe.ingredients,
            directions: recipe.directions
          }))
        }));
  
        return state.concat(recipes);
        
      case Types.ADD_RECIPE:
  
        if (!action.title) {
          return state;
        }
        const id = Counter.increment();
        return state.push(id, new Recipe({
          id,
          title: action.title,
          external_url: '',
          ingredients: '',
          directions: ''
        }));
        
      default:
        return state;
    }
  }
}

export default new Store();