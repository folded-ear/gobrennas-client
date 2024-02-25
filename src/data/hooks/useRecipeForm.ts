import ClientId from "util/ClientId";
import { DraftRecipe } from "global/types/recipe";

export function useRecipeForm<FormValues>(formValues: FormValues) {
    console.log(formValues);
    const newIngredient = (raw = "") => ({
        id: ClientId.next(),
        raw,
        ingredient: null,
        preparation: null,
        quantity: null,
    });

    const buildTemplate: () => DraftRecipe = () => ({
        id: ClientId.next(),
        name: "Something",
        externalUrl: "",
        ingredients: [newIngredient()],
        directions: "",
        yield: null,
        totalTime: null,
        calories: null,
        labels: [],
        photo: null,
        photoFocus: [],
    });

    return {
        draft: buildTemplate(),
    };
}
