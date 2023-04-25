export function extractRecipePhoto(recipe: any) { // todo: remove
    if (!recipe || !recipe.photo) return null;
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