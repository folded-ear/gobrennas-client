import React from 'react'
import {Container} from 'flux/utils';
import RecipesList from '../views/RecipesList';
import RecipeStore from '../data/RecipeStore';

export default Container.createFunctional(
    (props) => <RecipesList {...props}/>,
    () => [
        RecipeStore
    ],
    () => {
      return {
        recipes: RecipeStore.getState()
      }
    }
);