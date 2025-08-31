import { useDeleteRecipe } from "@/data/hooks/useDeleteRecipe";
import { useGetFullRecipe } from "@/data/hooks/useGetFullRecipe";
import ErrorOccurred from "@/features/RecipeEdit/components/ErrorOccurred";
import { useProfileId } from "@/providers/Profile";
import { ScalingProvider } from "@/util/ScalingContext";
import CloseButton from "@/views/common/CloseButton";
import CopyButton from "@/views/common/CopyButton";
import DeleteButton from "@/views/common/DeleteButton";
import EditButton from "@/views/common/EditButton";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import NotFound from "@/views/common/NotFound";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import RecipeDetail from "./components/RecipeDetail";
import ShareRecipe from "./components/ShareRecipe";

type Props = RouteComponentProps<{
    id: string;
}>;

const RecipeController: React.FC<Props> = ({ match }) => {
    const {
        loading,
        error,
        data: fullRecipe,
    } = useGetFullRecipe(match.params.id);
    const myId = useProfileId();
    const { deleteRecipe, error: deleteError } = useDeleteRecipe();
    const history = useHistory();

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error) {
        return <NotFound />;
    }
    const mine = !!fullRecipe && fullRecipe.owner.id === myId;

    const handleDelete = () =>
        fullRecipe?.recipe &&
        deleteRecipe(fullRecipe.recipe.id).then((result) => {
            if (result) history.push("/library");
        });

    return (
        fullRecipe &&
        fullRecipe.recipe && (
            <ScalingProvider>
                <ErrorOccurred
                    title="Unable to Delete"
                    errors={[deleteError?.message]}
                />
                <RecipeDetail
                    recipe={fullRecipe.recipe}
                    planHistory={fullRecipe.planHistory}
                    mine={mine}
                    owner={fullRecipe.owner}
                    showFab
                    nav={
                        <>
                            <CopyButton
                                title={
                                    mine ? "Duplicate" : "Copy to My Library"
                                }
                                onClick={() =>
                                    history.push(
                                        `/library/recipe/${fullRecipe?.recipe.id}/make-copy`,
                                    )
                                }
                            />
                            <ShareRecipe recipe={fullRecipe.recipe} />
                            {mine && (
                                <EditButton
                                    onClick={() =>
                                        history.push(
                                            `/library/recipe/${fullRecipe.recipe.id}/edit`,
                                        )
                                    }
                                />
                            )}
                            {mine && (
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
