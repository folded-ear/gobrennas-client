import * as React from "react";
import { useGetAllLabels } from "data/hooks/useGetAllLabels";
import { Redirect, useHistory, withRouter } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { useGetRecipe } from "data/hooks/useGetRecipe";
import PageBody from "views/common/PageBody";
import RecipeForm from "features/RecipeEdit/components/RecipeForm";
import DeleteButton from "views/common/DeleteButton";
import RecipeApi from "data/RecipeApi";
import { CircularProgress } from "@mui/material";
import { useUpdateRecipe } from "data/hooks/useUpdateRecipe";
import { useCreateRecipe } from "data/hooks/useCreateRecipe";
import type { BfsId } from "global/types/identity";
import type { DraftRecipe, Recipe } from "global/types/types";

type Props = RouteComponentProps<{ id?: string }>;

const RecipeEditController: React.FC<Props> = ({ match }) => {
    const id = match.params?.id || "";
    const history = useHistory();
    const { loading, error, data: recipe } = useGetRecipe(id);
    const { data: labelList } = useGetAllLabels();
    const { updateRecipe } = useUpdateRecipe();
    const { createRecipe } = useCreateRecipe();
    let draft: Recipe;

    if (!id) {
        return <Redirect to="/library" />;
    }

    if (loading || !recipe) {
        return <CircularProgress />;
    }

    if (error) {
        // TODO -- error message
    }

    const shouldCreateCopy = match.path.split("/").includes("make-copy");

    draft = { ...recipe };
    if (shouldCreateCopy) {
        draft = { ...recipe, name: `Copy of ${recipe.name}` };
    }

    const handleUpdate = (recipe: DraftRecipe) => {
        updateRecipe(recipe).then((_) => {
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
        RecipeApi.deleteRecipe(id);
    };

    const handleCancel = () => {
        history.push(`/library/recipe/${id}`);
    };

    return (
        <PageBody>
            <RecipeForm
                title={`Editing ${draft.name}`}
                recipe={draft}
                onSave={shouldCreateCopy ? handleSaveCopy : handleUpdate}
                onSaveCopy={handleSaveCopy}
                onCancel={handleCancel}
                labelList={labelList}
                extraButtons={
                    <DeleteButton
                        type="recipe"
                        label="Delete Recipe"
                        onConfirm={() => handleDelete(recipe.id)}
                    />
                }
            />
        </PageBody>
    );
};

export default withRouter(RecipeEditController);
