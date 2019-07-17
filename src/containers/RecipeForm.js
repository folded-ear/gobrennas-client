import React from 'react'
import { Container } from 'flux/utils'
import RecipeForm from '../views/RecipeForm'
import DraftRecipeStore from '../data/DraftRecipeStore'

export default Container.createFunctional(
    (props) => <RecipeForm {...props}/>,
    () => [
        DraftRecipeStore
    ],
    (prevState, props) => {
        return {
            draft: DraftRecipeStore.getDraftLO(),
            ...props
        }
    },
    { withProps: true}
)