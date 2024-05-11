import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import type { Recipe } from "global/types/types";
import LoadObject from "util/LoadObject";

export function recipeLoById(id): LoadObject<Recipe> {
    let lo = LibraryStore.getRecipeById(id);
    if (!lo.hasValue()) return lo;

    const subIds = new Set();
    const subs: Recipe[] = [];
    let loading = false;
    const prepRecipe = (recipe) => ({
        ...recipe,
        ingredients: (recipe.ingredients || []).map((ref) => {
            if (!ref.ingredientId) return ref;
            const iLO = LibraryStore.getIngredientById(ref.ingredientId);
            if (iLO.isLoading()) {
                loading = true;
            }
            if (!iLO.hasValue()) return ref;
            const ing = iLO.getValueEnforcing();
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
    const recipe = prepRecipe(lo.getValueEnforcing());
    recipe.subrecipes = subs;
    lo = LoadObject.withValue(recipe);
    if (loading) {
        lo = lo.loading();
    }
    return lo;
}
