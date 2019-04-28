import Immutable from 'immutable';
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
    return Immutable.OrderedMap();
  }
  
  reduce(state, action) {
    switch (action.type) {
      
      case Types.FETCH_RECIPES:
        console.log(action);
        return state;
        
      case Types.ADD_RECIPE:
  
        if (!action.title) {
          return state;
        }
        const id = Counter.increment();
        return state.set(id, new Recipe({
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