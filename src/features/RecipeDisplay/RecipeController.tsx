import FriendStore from "data/FriendStore";
import useFluxStore from "data/useFluxStore";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import React from "react";
import { RouteComponentProps } from "react-router";
import { Redirect } from "react-router-dom";
import LoadObject from "util/LoadObject";
import { useProfileLO } from "providers/Profile";
import { ScalingProvider } from "util/ScalingContext";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { UserType, } from "global/types/types";
import { Recipe as RecipeType, } from "features/RecipeDisplay/types";
import { useGetFullRecipe } from "./hooks/useGetFullRecipe";

export const buildFullRecipeLO = id => {
    let lo = LibraryStore.getIngredientById(id);
    if (!lo.hasValue()) return lo;

    const subIds = new Set();
    const subs: RecipeType[] = [];
    let loading = false;
    const prepRecipe = recipe => ({
        ...recipe,
        ingredients: (recipe.ingredients || []).map(ref => {
            if (!ref.ingredientId) return ref;
            const iLO = LibraryStore.getIngredientById(ref.ingredientId);
            if (iLO.isLoading()) {
                loading = true;
            }
            if (!iLO.hasValue()) return ref;
            const ing = iLO.getValueEnforcing();
            ref = {
                ...ref,
                ingredient: ing,
            };
            if (ing.type !== "Recipe") return ref;
            if (subIds.has(ing.id)) return ref;
            subIds.add(ing.id);
            subs.push(prepRecipe(ing));
            return ref;
        }),
    });
    const recipe = prepRecipe(lo.getValueEnforcing());
    recipe.subrecipes = subs;
    lo = LoadObject.withValue(recipe);
    if (loading) {
        lo = lo.loading();
    }
    console.log(lo)
    return lo;
};

type Props = RouteComponentProps<{
    id: string
}>;

interface State {
    recipeLO: LoadObject<RecipeType>,
    subrecipes?: RecipeType[]
    mine: boolean
    ownerLO: LoadObject<UserType>
}

const RecipeController: React.FC<Props> = ({ match }) => {
    const id = parseInt(match.params.id, 10);

    const result = useGetFullRecipe(match.params.id)
    console.log(result)

    const profileLO = useProfileLO();
    const state = useFluxStore(
        () => {
            const recipeLO = buildFullRecipeLO(id);
            const state: State = {
                recipeLO,
                mine: false,
                ownerLO: profileLO,
            };
            if (!recipeLO.hasValue()) return state;

            const recipe = recipeLO.getValueEnforcing();
            state.subrecipes = recipe.subrecipes;
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
        ],
        [id, profileLO],
    );

    if (state.recipeLO.hasValue()) {
        console.log(state)
        return <ScalingProvider>
            <RecipeDetail
                {...state}
                canFavorite
                canShare
                canSendToPlan
            />
        </ScalingProvider>;
    }

    if (state.recipeLO.isLoading()) {
        return <LoadingIndicator />;
    }

    return <Redirect to="/library" />;
};

export default RecipeController;
