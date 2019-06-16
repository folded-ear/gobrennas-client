import React from 'react'
import RecipeAdd from '../views/RecipeAdd';
import {Container} from 'flux/utils';
import Store from '../data/RecipeStore';

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

export default Container.createFunctional(props => <RecipeAdd {...props}/>, getStores, getState);