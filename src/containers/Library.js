import React from 'react'
import {Container} from 'flux/utils';
import RecipesList from '../views/RecipesList';
import RecipeStore from '../data/RecipeStore';
import LibraryStore from '../data/LibraryStore'

export default Container.createFunctional(
    (props) => <RecipesList {...props}/>,
    () => [
        LibraryStore,
        RecipeStore
    ],
    () => {
      return {
        recipes: RecipeStore.getState(),
        libraryLO: LibraryStore.getLibraryLO()
      }
    }
);