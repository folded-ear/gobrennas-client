import * as React from "react";
import { DraftRecipe } from "global/types/types";
import RecipeForm from "features/RecipeEdit/components/RecipeForm";
import PageBody from "views/common/PageBody";
import { useCreateRecipe } from "data/hooks/useCreateRecipe";
import { useGetAllLabels } from "data/hooks/useGetAllLabels";
import ClientId from "util/ClientId";
import { useHistory } from "react-router-dom";

export const RecipeAddController = () => {
    const { data: labelList } = useGetAllLabels();
    const { createRecipe } = useCreateRecipe();
    const history = useHistory();

    const draft = {
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
        sourceId: "",
    };

    const handleSave = (recipe: DraftRecipe) => {
        createRecipe(recipe).then((result) => {
            const id = result.data?.library?.createRecipe.id;
            id
                ? history.push(`/library/recipe/${id}`)
                : history.push(`/library`);
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
            <RecipeForm
                recipe={draft}
                title={"Add A New Recipe"}
                labelList={labelList}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </PageBody>
    );
};
