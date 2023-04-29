import FriendStore from "data/FriendStore";
import React from "react";
import { RouteComponentProps } from "react-router";
import LoadObject from "util/LoadObject";
import { useProfileLO } from "providers/Profile";
import { ScalingProvider } from "util/ScalingContext";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { UserType } from "global/types/types";
import { Recipe as RecipeType } from "features/RecipeDisplay/types";
import { useGetFullRecipe } from "./hooks/useGetFullRecipe";

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
    const me : UserType = profileLO.getValueEnforcing();

    const {loading, data: fullRecipe} = useGetFullRecipe(match.params.id);

    const isMine = React.useMemo(() => {
        return fullRecipe?.ownerId === me.id.toString(10);
    },[me, fullRecipe]);

    const ownerId = React.useMemo(() => {
        return isMine ? me.id : FriendStore.getFriendLO(fullRecipe?.ownerId || 0);
    },[isMine, me, fullRecipe]);

    if(loading || !fullRecipe) {
        return <LoadingIndicator />;
    }

    return fullRecipe.recipe && <ScalingProvider>
        <RecipeDetail
            recipe={fullRecipe.recipe}
            subrecipes={fullRecipe.subrecipes}
            mine={fullRecipe.mine}
            ownerLO={profileLO}
            canFavorite
            canShare
            canSendToPlan
        />
    </ScalingProvider>;
};

export default RecipeController;
