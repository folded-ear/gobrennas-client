import React from 'react'
import { Container } from 'flux/utils'
import RecipesList from '../views/RecipesList'
import RecipeStore from '../data/RecipeStore'
import LibraryStore from '../data/LibraryStore'
import { humanStringComparator } from "../util/comparators"
import UserStore from "../data/UserStore"

export default Container.createFunctional(
    (props) => <RecipesList {...props}/>,
    () => [
        UserStore,
        LibraryStore,
        RecipeStore,
    ],
    () => ({
        me: UserStore.getProfileLO().getValueEnforcing(),
        scope: LibraryStore.getState().scope,
        filter: LibraryStore.getState().filter,
        libraryLO: LibraryStore.getLibraryLO()
            .map(rs => rs.sort(humanStringComparator)),
        shoppingList: LibraryStore.getShoppingList(),
    })
)
