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
import { useCreateRecipe } from "@/data/hooks/useCreateRecipe";
import type { BfsId } from "@/global/types/identity";
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
    const { error: createError, createRecipe } = useCreateRecipe();
    const myProfileId = useProfileId();
    const [deleteRecipe] = useDeleteRecipe();

    if (!id) {
        return <Redirect to="/library" />;
    }

    if (loading || !recipe) {
        return <CircularProgress />;
    }

    if (
        myProfileId &&
        recipe.ownerId &&
        myProfileId.toString() !== recipe.ownerId.toString()
    ) {
        return (
            <Alert severity={"error"}>
                You can only{" "}
                <Link to={`/library/recipe/${id}`}>view this recipe</Link>, not
                edit it, because it&apos;s not yours.
            </Alert>
        );
    }

    const shouldCreateCopy = match.path.split("/").includes("make-copy");

    const draft = { ...recipe };
    if (shouldCreateCopy) {
        draft.name = `Copy of ${draft.name}`;
    }

    const handleUpdate = (recipe: DraftRecipe) => {
        updateRecipe(recipe).then(() => {
            history.push(`/library/recipe/${recipe.id}`);
        });
    };

    const handleSaveCopy = (recipe: DraftRecipe) => {
        createRecipe(recipe).then((result) => {
            const id = result.data?.library?.createRecipe.id;
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
                title={`Editing ${draft.name}`}
                recipe={draft}
                onSave={shouldCreateCopy ? handleSaveCopy : handleUpdate}
                onSaveCopy={handleSaveCopy}
                onCancel={handleCancel}
                labelList={labelList}
                extraButtons={
                    <DeleteButton
                        variant="text"
                        color="error"
                        forType="recipe"
                        label="Delete Recipe"
                        onConfirm={() => handleDelete(recipe.id)}
                    />
                }
            />
        </PageBody>
    );
};

export default withRouter(RecipeEditController);
