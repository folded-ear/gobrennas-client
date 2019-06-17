import React from 'react'
import RecipesList from '../views/RecipesList';
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

export default Container.createFunctional(
    (props) => <RecipesList {...props}/>,
    getStores,
    getState
);