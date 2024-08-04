import LibraryStore from "@/features/RecipeLibrary/data/LibraryStore";
import type { Recipe } from "@/global/types/types";
import { RippedLO } from "@/util/ripLoadObject";

export function recipeRloById(id): RippedLO<Recipe & { subrecipes: Recipe[] }> {
    const rlo = LibraryStore.getRecipeRloById(id);
    if (!rlo.data) return rlo;

    const subIds = new Set();
    const subs: Recipe[] = [];
    let loading = false;
    const prepRecipe = (recipe) => ({
        ...recipe,
        ingredients: (recipe.ingredients || []).map((ref) => {
            if (!ref.ingredientId) return ref;
            const iRlo = LibraryStore.getIngredientRloById(ref.ingredientId);
            if (iRlo.loading) {
                loading = true;
            }
            const ing = iRlo.data;
            if (!ing) return ref;
            ref = {
                ...ref,
                ingredient: ing,
            };
            if (ing.type !== "Recipe") return ref;
            if (subIds.has(ing.id)) return ref;
            subIds.add(ing.id);
            subs.push(prepRecipe(ing));
            return ref;
        }),
    });
    const recipe = prepRecipe(rlo.data);
    recipe.subrecipes = subs;
    return {
        ...rlo,
        data: recipe,
        loading,
    };
}
