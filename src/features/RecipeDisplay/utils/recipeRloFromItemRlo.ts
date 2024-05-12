import planStore from "features/Planner/data/planStore";
import LibraryStore from "../../RecipeLibrary/data/LibraryStore";
import type { Ingredient, RecipeFromPlanItem } from "global/types/types";
import PlanItemStatus from "../../Planner/data/PlanItemStatus";
import { RippedLO } from "../../../util/ripLoadObject";

export const recipeRloFromItemRlo = (
    itemRlo: RippedLO<any>,
): RippedLO<RecipeFromPlanItem> => {
    if (!itemRlo.data) return itemRlo;

    const subs: any[] = [];
    let loading = false;
    const computeKids = (item) => {
        const subIds = item.subtaskIds || [];
        const subIdLookup = new Set(subIds);
        return subIds
            .concat(
                (item.componentIds || []).filter((id) => !subIdLookup.has(id)),
            )
            .map((id) => planStore.getItemRlo(id))
            .filter((rlo) => {
                if (!rlo.data) {
                    loading = true;
                    return false;
                }
                return true;
            })
            .map((rlo) => rlo.data);
    };
    const prepRecipe = (
        item,
        rLO?: RippedLO<any>,
        ancestorCompleting = false,
        ancestorDeleting = false,
    ): RecipeFromPlanItem => {
        const completing = item._next_status === PlanItemStatus.COMPLETED;
        const deleting = item._next_status === PlanItemStatus.DELETED;
        item = {
            ...item,
            completing,
            deleting,
            ancestorCompleting,
            ancestorDeleting,
            ingredients: computeKids(item).map((ref) => {
                ref = {
                    ...ref,
                    raw: ref.name,
                };
                let recurse = ref.subtaskIds && ref.subtaskIds.length;
                let iRlo: RippedLO<Ingredient> | undefined;
                if (ref.ingredientId) {
                    iRlo = LibraryStore.getIngredientRloById(ref.ingredientId);
                    if (iRlo.loading) {
                        loading = true;
                    }
                    const ing = iRlo.data;
                    if (ing) {
                        ref.ingredient = ing;
                        recurse = recurse || ing.type === "Recipe";
                    }
                }
                if (recurse && subs.every((s) => s.id !== ref.id)) {
                    subs.push(
                        prepRecipe(
                            ref,
                            iRlo,
                            completing || ancestorCompleting,
                            deleting || ancestorDeleting,
                        ),
                    );
                }
                return ref;
            }),
        };
        if (item.notes) {
            // replace the recipe's directions
            item.directions = item.notes;
        }
        if (!item.ingredientId) return item;
        rLO = rLO || LibraryStore.getIngredientRloById(item.ingredientId);
        if (rLO.loading) {
            loading = true;
        }
        const r = rLO.data;
        if (!r) return item;
        Object.keys(r)
            .filter((k) => !item.hasOwnProperty(k))
            .forEach((k) => (item[k] = r[k]));
        item.libraryRecipeId = item.ingredientId || undefined;
        return item;
    };
    const recipe = prepRecipe(itemRlo.data);
    recipe.subrecipes = subs;
    return {
        ...itemRlo,
        data: recipe,
        loading,
    };
};
