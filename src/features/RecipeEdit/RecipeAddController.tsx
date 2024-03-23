import * as React from "react";
import { DraftRecipe, Recipe } from "global/types/types";
import PageBody from "views/common/PageBody";
import { useCreateRecipe } from "data/hooks/useCreateRecipe";
import ClientId from "util/ClientId";
import { useHistory } from "react-router-dom";
import { Alert } from "@mui/material";
import { DraftRecipeController } from "features/RecipeEdit/DraftRecipeController";

export const RecipeAddController = () => {
    const { error: createError, createRecipe } = useCreateRecipe();
    const history = useHistory();

    const recipe: Recipe = {
        id: ClientId.next(),
        name: "",
        externalUrl: "",
        ingredients: [
            {
                id: ClientId.next(),
                raw: "",
                ingredient: null,
                preparation: null,
                quantity: null,
            },
        ],
        directions: "",
        recipeYield: null,
        totalTime: null,
        calories: null,
        labels: [],
        photo: null,
        photoFocus: null,
    };

    const handleSave = (recipe: DraftRecipe) => {
        createRecipe(recipe).then((result) => {
            history.push(
                `/library/recipe/${result.data?.library?.createRecipe.id}`,
            );
        });
    };

    const handleCancel = (recipe?: DraftRecipe) => {
        if (recipe?.sourceId) {
            history.push(`/library/recipe/${recipe.sourceId}`);
        }
        history.push("/library");
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
                title="Add a New Recipe"
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </PageBody>
    );
};
