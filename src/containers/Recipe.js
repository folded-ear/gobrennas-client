import { Container } from 'flux/utils';
import React from 'react';
import { withRouter } from 'react-router-dom';
import FriendStore from "../data/FriendStore";
import LibraryStore, { isRecipeStaged } from "../data/LibraryStore";
import RecipeStore from '../data/RecipeStore';
import UserStore from "../data/UserStore";
import RecipeDetail from '../views/RecipeDetail';

export default withRouter(Container.createFunctional(
    (props) => <RecipeDetail {...props}/>,
    () => [
        FriendStore,
        LibraryStore,
        RecipeStore,
    ],
    (prevState, props) => {
        const { match } = props;
        const id = parseInt(match.params.id, 10);
        const lo = LibraryStore.getRecipeById(id);
        const state = {recipeLO: lo};
        if (lo.hasValue()) {
            const profileLO = UserStore.getProfileLO();
            const me = profileLO.getValueEnforcing();
            const r = lo.getValueEnforcing();
            state.mine = r.ownerId === me.id;
            state.ownerLO = state.mine
                ? profileLO
                : FriendStore.getFriendLO(r.ownerId);
            state.staged = isRecipeStaged(r);
        }
        return state;
    },
    { withProps: true }
));