import React from 'react'
import { Container } from 'flux/utils'
import RecipesList from '../views/RecipesList'
import RecipeStore from '../data/RecipeStore'
import LibraryStore from '../data/LibraryStore'
import { humanStringComparator } from "../util/comparators"

export default Container.createFunctional(
    (props) => <RecipesList {...props}/>,
    () => [
        LibraryStore,
        RecipeStore
    ],
    () => ({
        recipes: RecipeStore.getState(),
        libraryLO: LibraryStore.getLibraryLO()
            .map(rs => rs.sort(humanStringComparator)),
        stagedRecipes: LibraryStore.getStagedRecipes(),
        shoppingList: LibraryStore.getShoppingList(),
    })
)