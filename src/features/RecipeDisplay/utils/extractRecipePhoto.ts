import { Recipe } from "@/global/types/types";

export function extractRecipePhoto(recipe: Recipe) {
    if (!recipe?.photo) return null;
    // noinspection SuspiciousTypeOfGuard
    if (typeof recipe.photo === "string") {
        // REST supplied
        return {
            url: recipe.photo,
            focus: recipe.photoFocus,
        };
    } else {
        // GraphQL supplied
        return recipe.photo;
    }
}
