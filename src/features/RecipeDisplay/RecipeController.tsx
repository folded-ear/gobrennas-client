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
import { UserType } from "global/types/types";
import { Recipe as RecipeType } from "features/RecipeDisplay/types";
import { useGetFullRecipe } from "./hooks/useGetFullRecipe";
import { recipeLoById } from "features/RecipeDisplay/utils/recipeLoById";

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

    const profileLO = useProfileLO();
    const state = useFluxStore(
        () => {
            const recipeLO = recipeLoById(id);
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
        return <ScalingProvider>
            <RecipeDetail
                recipe={state.recipeLO.getValueEnforcing()}
                subrecipes={state.subrecipes}
                mine={state.mine}
                ownerLO={state.ownerLO}
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
