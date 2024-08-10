import React from "react";
import { RouteComponentProps } from "react-router";
import { ScalingProvider } from "@/util/ScalingContext";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { useGetFullRecipe } from "@/data/hooks/useGetFullRecipe";
import CopyButton from "@/views/common/CopyButton";
import history from "@/util/history";
import ShareRecipe from "./components/ShareRecipe";
import CloseButton from "@/views/common/CloseButton";
import EditButton from "@/views/common/EditButton";
import DeleteButton from "@/views/common/DeleteButton";
import NotFound from "@/views/common/NotFound";
import { useDeleteRecipe } from "@/data/hooks/useDeleteRecipe";

type Props = RouteComponentProps<{
    id: string;
}>;

const RecipeController: React.FC<Props> = ({ match }) => {
    const {
        loading,
        error,
        data: fullRecipe,
    } = useGetFullRecipe(match.params.id);
    const [deleteRecipe] = useDeleteRecipe();

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error) {
        return <NotFound />;
    }

    const handleDelete = () =>
        fullRecipe?.recipe &&
        deleteRecipe(fullRecipe.recipe.id).then((result) => {
            if (result) history.push("/library");
        });

    return (
        fullRecipe &&
        fullRecipe.recipe && (
            <ScalingProvider>
                <RecipeDetail
                    recipe={fullRecipe.recipe}
                    subrecipes={fullRecipe.subrecipes}
                    planHistory={fullRecipe.planHistory}
                    mine={fullRecipe.mine}
                    owner={fullRecipe.owner}
                    showFab
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
                                    forType="recipe"
                                    onConfirm={handleDelete}
                                />
                            )}
                            <CloseButton onClick={() => history.goBack()} />
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
