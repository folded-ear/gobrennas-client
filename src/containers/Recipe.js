import PropTypes from "prop-types";
import React from "react";
import FriendStore from "../data/FriendStore";
import useIngredientLO from "../data/useIngredientLO";
import useProfileLO from "../data/useProfileLO";
import RecipeDetail from "../views/cook/RecipeDetail";

const Recipe = ({match}) => {
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
    }
    return <RecipeDetail {...state} />;
};

Recipe.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired
};

export default Recipe;
