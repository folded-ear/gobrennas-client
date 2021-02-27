import PropTypes from "prop-types";
import React from "react";
import FriendStore from "../data/FriendStore";
import LibraryStore from "../data/LibraryStore";
import useFluxStore from "../data/useFluxStore";
import UserStore from "../data/UserStore";
import LoadObject from "../util/LoadObject";
import RecipeDetail from "../views/cook/RecipeDetail";

const Recipe = ({match}) => {
    const id = parseInt(match.params.id, 10);
    const state = useFluxStore(
        () => {
            const recipeLO = LibraryStore.getIngredientById(id);
            const state = {
                recipeLO,
                subrecipes: [],
            };
            const subIds = new Set();
            const collectSubrecipes = r => {
                if (r.ingredients == null) return r;
                return {
                    ...r,
                    ingredients: r.ingredients.map(ref => {
                        if (!ref.ingredientId) return ref;
                        const iLO = LibraryStore.getIngredientById(ref.ingredientId);
                        if (!iLO || !iLO.done() || !iLO.hasValue()) return ref;
                        const ing = iLO.getValueEnforcing();
                        ref = {
                            ...ref,
                            ingredient: ing,
                        };
                        if (ing.type !== "Recipe") return ref;
                        if (subIds.has(ing.id)) return ref;
                        subIds.add(ing.id);
                        state.subrecipes.push(collectSubrecipes(ing));
                        return ref;
                    }),
                };
            };
            if (!recipeLO.hasValue()) return state;
            const recipe = collectSubrecipes(recipeLO.getValueEnforcing());
            state.recipeLO = LoadObject.withValue(recipe);

            const profileLO = UserStore.getProfileLO();
            if (!profileLO.hasValue()) return state;
            const me = profileLO.getValueEnforcing();
            state.mine = recipe.ownerId === me.id;
            state.ownerLO = state.mine
                ? profileLO
                : FriendStore.getFriendLO(recipe.ownerId);

            return state;
        },
        [
            LibraryStore,
            UserStore,
        ],
        [id],
    );

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
