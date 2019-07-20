import React from 'react'
import { Container } from 'flux/utils'
import { withRouter } from 'react-router-dom'
import RecipeDetail from '../views/RecipeDetail'
import RecipeStore from '../data/RecipeStore'
import LibraryStore from "../data/LibraryStore"

export default withRouter(Container.createFunctional(
    (props) => <RecipeDetail {...props}/>,
    () => [
        LibraryStore,
        RecipeStore,
    ],
    (prevState, props) => {
        const { match } = props
        const id = parseInt(match.params.id, 10)
        const recipeLO = LibraryStore.getRecipeById(id)
        return {
            recipeLO,
            staged: LibraryStore.isStaged(id),
        }
    },
    { withProps: true }
))