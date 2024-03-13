import React from "react";
import { RouteComponentProps } from "react-router";
import { ScalingProvider } from "util/ScalingContext";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { useGetFullRecipe } from "data/hooks/useGetFullRecipe";
import CopyButton from "../../views/common/CopyButton";
import history from "../../util/history";
import ShareRecipe from "./components/ShareRecipe";
import CloseButton from "../../views/common/CloseButton";
import EditButton from "../../views/common/EditButton";
import DeleteButton from "../../views/common/DeleteButton";
import RecipeApi from "../../data/RecipeApi";
import NotFound from "../../views/common/NotFound";

type Props = RouteComponentProps<{
    id: string;
}>;

const RecipeController: React.FC<Props> = ({ match }) => {
    const {
        loading,
        error,
        data: fullRecipe,
    } = useGetFullRecipe(match.params.id);

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error) {
        return <NotFound />;
    }

    return (
        fullRecipe &&
        fullRecipe.recipe && (
            <ScalingProvider>
                <RecipeDetail
                    recipe={fullRecipe.recipe}
                    subrecipes={fullRecipe.subrecipes}
                    mine={fullRecipe.mine}
                    owner={fullRecipe.owner}
                    nav={
                        <>
                            <CopyButton
                                title={
                                    fullRecipe.mine
                                        ? "Duplicate"
                                        : "Copy to My Library"
                                }
                                onClick={() =>
                                    history.push(
                                        `/library/recipe/${fullRecipe?.recipe.id}/make-copy`,
                                    )
                                }
                            />
                            <ShareRecipe recipe={fullRecipe.recipe} />
                            {fullRecipe.mine && (
                                <EditButton
                                    onClick={() =>
                                        history.push(
                                            `/library/recipe/${fullRecipe.recipe.id}/edit`,
                                        )
                                    }
                                />
                            )}
                            {fullRecipe.mine && (
                                <DeleteButton
                                    type="recipe"
                                    onConfirm={() =>
                                        RecipeApi.deleteRecipe(
                                            fullRecipe.recipe.id,
                                        )
                                    }
                                />
                            )}
                            <CloseButton
                                onClick={() => history.push("/library")}
                            />
                        </>
                    }
                    canFavorite
                    canShare
                    canSendToPlan
                />
            </ScalingProvider>
        )
    );
};

export default RecipeController;
