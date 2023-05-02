import React from "react";
import { RouteComponentProps } from "react-router";
import { ScalingProvider } from "util/ScalingContext";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { useGetFullRecipe } from "./hooks/useGetFullRecipe";

type Props = RouteComponentProps<{
    id: string
}>;

const RecipeController: React.FC<Props> = ({ match }) => {
    const { loading, data: fullRecipe } = useGetFullRecipe(match.params.id);

    if (loading || !fullRecipe) {
        return <LoadingIndicator />;
    }

    return fullRecipe.recipe && <ScalingProvider>
        <RecipeDetail
            recipe={fullRecipe.recipe}
            subrecipes={fullRecipe.subrecipes}
            mine={fullRecipe.mine}
            owner={fullRecipe.owner}
            canFavorite
            canShare
            canSendToPlan
        />
    </ScalingProvider>;
};

export default RecipeController;
