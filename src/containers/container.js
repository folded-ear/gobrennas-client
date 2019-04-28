import View from '../views/view';
import {Container} from 'flux/utils';
import Store from '../data/store';

function getStores() {
  return [
    Store
  ];
}

function getState() {
  return {
    recipes: Store.getState()
  };
}

export default Container.createFunctional(View, getStores, getState);