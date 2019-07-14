import React from 'react'
import { Container } from 'flux/utils'
import { withRouter } from 'react-router-dom'
import RecipeEdit from '../views/RecipeEdit'
import RecipeStore from '../data/RecipeStore'
import LibraryStore from "../data/LibraryStore"
import DraftStore from '../data/DraftRecipeStore'
import Dispatcher from "../data/dispatcher"
import RecipeActions from "../data/RecipeActions"

export default withRouter(Container.createFunctional(
    (props) => <RecipeEdit {...props}/>,
    () => [
        LibraryStore,
        RecipeStore,
        DraftStore
    ],
    (prevState, props) => {
        const { match } = props
        const recipeLO = LibraryStore.getRecipeById(parseInt(match.params.id, 10))
        
        if(recipeLO.hasValue()) {
            const id = recipeLO.getValueEnforcing().id
            if(DraftStore.shouldLoadDraft(id)){
                setTimeout(() => {
                    Dispatcher.dispatch({
                        type: RecipeActions.LOAD_RECIPE_DRAFT,
                        data: recipeLO.getValueEnforcing()
                    })
                })
            }
        }
        
        return {
            recipeLO,
        }
    },
    { withProps: true }
))