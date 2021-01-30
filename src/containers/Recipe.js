import React from "react";
import { withRouter } from "react-router-dom";
import FriendStore from "../data/FriendStore";
import { isRecipeStaged } from "../data/LibraryStore";
import useIngredientLO from "../data/useIngredientLO";
import useProfileLO from "../data/useProfileLO";
import RecipeDetail from "../views/cook/RecipeDetail";

export default withRouter(({match}) => {
    const id = parseInt(match.params.id, 10);
    const lo = useIngredientLO(id);
    const state = {
        recipeLO: lo,
    };
    const profileLO = useProfileLO();
    if (lo.hasValue()) {
        const me = profileLO.getValueEnforcing();
        const r = lo.getValueEnforcing();
        state.mine = r.ownerId === me.id;
        state.ownerLO = state.mine
            ? profileLO
            : FriendStore.getFriendLO(r.ownerId);
        state.staged = isRecipeStaged(r);
    }
    return <RecipeDetail {...state} />;
});
