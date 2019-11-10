import React from 'react'
import { Container } from 'flux/utils'
import { withRouter } from 'react-router-dom'
import RecipeDetail from '../views/RecipeDetail'
import RecipeStore from '../data/RecipeStore'
import LibraryStore, { isRecipeStaged } from "../data/LibraryStore"
import UserStore from "../data/UserStore"

export default withRouter(Container.createFunctional(
    (props) => <RecipeDetail {...props}/>,
    () => [
        UserStore,
        LibraryStore,
        RecipeStore,
    ],
    (prevState, props) => {
        const { match } = props
        const id = parseInt(match.params.id, 10)
        const lo = LibraryStore.getRecipeById(id)
        const state = {recipeLO: lo}
        if (lo.hasValue()) {
            const me = UserStore.getProfileLO().getValueEnforcing()
            const r = lo.getValueEnforcing()
            state.mine = r.ownerId === me.id
            state.staged = isRecipeStaged(r)
        }
        return state
    },
    { withProps: true }
))