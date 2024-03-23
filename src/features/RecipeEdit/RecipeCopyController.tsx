import { DraftRecipeController } from "features/RecipeEdit/DraftRecipeController";
import { useGetRecipe } from "data/hooks/useGetRecipe";
import { Redirect, useHistory, useRouteMatch } from "react-router-dom";
import { Alert, CircularProgress } from "@mui/material";
import * as React from "react";
import { useCreateRecipe } from "data/hooks/useCreateRecipe";
import { DraftRecipe } from "global/types/types";
import PageBody from "views/common/PageBody";

export const RecipeCopyController: React.FC = () => {
    const { params } = useRouteMatch<{ id: string }>();
    const id = params?.id || "";
    const history = useHistory();
    const { loading, data: recipe } = useGetRecipe(id);
    const { error: createError, createRecipe } = useCreateRecipe();

    if (!id) {
        return <Redirect to="/library" />;
    }

    if (loading || !recipe) {
        return <CircularProgress />;
    }

    const handleSave = (recipe: DraftRecipe) => {
        createRecipe(recipe).then((result) => {
            const id = result.data?.library?.createRecipe.id;
            id
                ? history.push(`/library/recipe/${id}`)
                : history.push(`/library`);
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
            <DraftRecipeController
                recipe={recipe}
                title={`Copy of ${recipe.name}`}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </PageBody>
    );
};
