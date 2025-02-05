import LibraryStore from "@/features/RecipeLibrary/data/LibraryStore";
import type { Recipe } from "@/global/types/types";
import { RippedLO } from "@/util/ripLoadObject";
import { ensureString } from "@/global/types/identity";

type RecipeWithSubs = Recipe & { subrecipes: Recipe[] };

export function recipeRloById(id: string): RippedLO<RecipeWithSubs> {
    const rlo = LibraryStore.getRecipeRloById(id);
    if (!rlo.data) {
        // with no data, this cast is safe
        return rlo as RippedLO<RecipeWithSubs>;
    }

    const subIds = new Set<string>();
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
            const stringIngId = ensureString(ing.id);
            if (subIds.has(stringIngId)) return ref;
            subIds.add(stringIngId);
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
