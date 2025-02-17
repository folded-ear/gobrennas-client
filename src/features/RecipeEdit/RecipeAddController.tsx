import { useCreateRecipe } from "@/data/hooks/useCreateRecipe";
import { useGetAllLabels } from "@/data/hooks/useGetAllLabels";
import RecipeForm from "@/features/RecipeEdit/components/RecipeForm";
import { DraftRecipe } from "@/global/types/types";
import ClientId from "@/util/ClientId";
import PageBody from "@/views/common/PageBody";
import { Alert } from "@mui/material";
import { useHistory } from "react-router-dom";

export const RecipeAddController = () => {
    const { data: labelList } = useGetAllLabels();
    const { error, createRecipe } = useCreateRecipe();
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
            {error && (
                <Alert severity="error">Unable to save: {error?.message}</Alert>
            )}
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
