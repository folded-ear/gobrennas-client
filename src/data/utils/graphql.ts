import { IngredientInfo, IngredientRefInfo } from "@/__generated__/graphql";
import { DraftRecipe } from "@/global/types/types";
import { toMilliseconds } from "@/util/time";

/**
 * Converts a DraftRecipe to IngredientInfo for transmission
 * @return IngredientInfo
 * @param recipe
 */
export function recipeToIngredientInfo(recipe: DraftRecipe): IngredientInfo {
    return {
        type: "Recipe",
        name: recipe.name || "",
        storeOrder: 1,
        externalUrl: recipe.externalUrl || "",
        directions: recipe.directions || "",
        ingredients: recipe.ingredients.map((it) => {
            it = { ...it };
            delete it.id;
            return it as IngredientRefInfo;
        }),
        labels: recipe.labels || [],
        yield: recipe.recipeYield ? recipe.recipeYield : null,
        calories: recipe.calories ? recipe.calories : null,
        totalTime: recipe.totalTime ? toMilliseconds(recipe.totalTime) : null,
        photoFocus: recipe.photoFocus ?? null,
    };
}
