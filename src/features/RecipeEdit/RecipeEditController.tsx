import { useCreateRecipeFrom } from "@/data/hooks/useCreateRecipeFrom";
import { useDeleteRecipe } from "@/data/hooks/useDeleteRecipe";
import { useGetAllLabels } from "@/data/hooks/useGetAllLabels";
import { useGetRecipe } from "@/data/hooks/useGetRecipe";
import { useUpdateRecipe } from "@/data/hooks/useUpdateRecipe";
import ErrorOccurred from "@/features/RecipeEdit/components/ErrorOccurred";
import RecipeForm from "@/features/RecipeEdit/components/RecipeForm";
import { BfsId } from "@/global/types/identity";
import type { DraftRecipe } from "@/global/types/types";
import { useProfileId } from "@/providers/Profile";
import DeleteButton from "@/views/common/DeleteButton";
import PageBody from "@/views/common/PageBody";
import { Alert, CircularProgress } from "@mui/material";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link, Redirect, useHistory, withRouter } from "react-router-dom";

type Props = RouteComponentProps<{ id?: string }>;

const RecipeEditController: React.FC<Props> = ({ match }) => {
    const id = match.params?.id || "";
    const history = useHistory();
    const { loading, data: recipe } = useGetRecipe(id);
    const { data: labelList } = useGetAllLabels();
    const { error: updateError, updateRecipe } = useUpdateRecipe();
    const { error: createError, createRecipeFrom } = useCreateRecipeFrom();
    const myProfileId = useProfileId();
    const { error: deleteError, deleteRecipe } = useDeleteRecipe();

    if (!id) {
        return <Redirect to="/library" />;
    }

    if (loading || !recipe) {
        return <CircularProgress />;
    }

    const shouldCreateCopy = match.path.split("/").includes("make-copy");

    const isMine = myProfileId && myProfileId === recipe.ownerId;
    if (!isMine && !shouldCreateCopy) {
        return (
            <Alert severity={"error"}>
                You can only{" "}
                <Link to={`/library/recipe/${id}`}>view this recipe</Link>, not
                edit it, because it&apos;s not yours.
            </Alert>
        );
    }

    const handleUpdate = (recipe: DraftRecipe) => {
        updateRecipe(recipe).then(() => {
            history.push(`/library/recipe/${recipe.id}`);
        });
    };

    const handleSaveCopy = (recipe: DraftRecipe) => {
        createRecipeFrom(recipe).then((result) => {
            const id = result.data?.library?.createRecipeFrom.id;
            history.push(id ? `/library/recipe/${id}` : `/library`);
        });
    };

    const handleDelete = (id: BfsId) => {
        deleteRecipe(id).then((result) => {
            if (result) history.push("/library");
        });
    };

    const handleCancel = () => {
        history.push(`/library/recipe/${id}`);
    };

    return (
        <PageBody>
            <ErrorOccurred
                title="Server Error"
                errors={[
                    createError?.message,
                    updateError?.message,
                    deleteError?.message,
                ]}
            />
            <RecipeForm
                title={
                    shouldCreateCopy
                        ? `Copy ${recipe.name}`
                        : `Edit ${recipe.name}`
                }
                recipe={recipe}
                onSave={shouldCreateCopy ? handleSaveCopy : handleUpdate}
                onSaveCopy={shouldCreateCopy ? undefined : handleSaveCopy}
                onCancel={handleCancel}
                labelList={labelList}
                extraButtons={
                    shouldCreateCopy ? undefined : (
                        <DeleteButton
                            variant="text"
                            color="error"
                            forType="recipe"
                            label="Delete Recipe"
                            onConfirm={() => handleDelete(recipe.id)}
                        />
                    )
                }
            />
        </PageBody>
    );
};

export default withRouter(RecipeEditController);
