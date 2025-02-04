import * as React from "react";
import { useGetAllLabels } from "@/data/hooks/useGetAllLabels";
import { Link, Redirect, useHistory, withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { useGetRecipe } from "@/data/hooks/useGetRecipe";
import PageBody from "@/views/common/PageBody";
import RecipeForm from "@/features/RecipeEdit/components/RecipeForm";
import DeleteButton from "@/views/common/DeleteButton";
import { Alert, CircularProgress } from "@mui/material";
import { useUpdateRecipe } from "@/data/hooks/useUpdateRecipe";
import { useCreateRecipeFrom } from "@/data/hooks/useCreateRecipeFrom";
import { BfsId, bfsIdEq } from "@/global/types/identity";
import type { DraftRecipe } from "@/global/types/types";
import { useDeleteRecipe } from "@/data/hooks/useDeleteRecipe";
import { useProfileId } from "@/providers/Profile";

type Props = RouteComponentProps<{ id?: string }>;

const RecipeEditController: React.FC<Props> = ({ match }) => {
    const id = match.params?.id || "";
    const history = useHistory();
    const { loading, data: recipe } = useGetRecipe(id);
    const { data: labelList } = useGetAllLabels();
    const { error: updateError, updateRecipe } = useUpdateRecipe();
    const { error: createError, createRecipeFrom } = useCreateRecipeFrom();
    const myProfileId = useProfileId();
    const [deleteRecipe] = useDeleteRecipe();

    if (!id) {
        return <Redirect to="/library" />;
    }

    if (loading || !recipe) {
        return <CircularProgress />;
    }

    const shouldCreateCopy = match.path.split("/").includes("make-copy");

    const isMine = myProfileId && bfsIdEq(myProfileId, recipe.ownerId);
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
            id
                ? history.push(`/library/recipe/${id}`)
                : history.push(`/library`);
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
            {createError && (
                <Alert severity="error">
                    Unable to save: {createError?.message}
                </Alert>
            )}
            {updateError && (
                <Alert severity="error">
                    Unable to save: {updateError?.message}
                </Alert>
            )}
            <RecipeForm
                title={
                    shouldCreateCopy
                        ? `Copy ${recipe.name}`
                        : `Editing ${recipe.name}`
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
