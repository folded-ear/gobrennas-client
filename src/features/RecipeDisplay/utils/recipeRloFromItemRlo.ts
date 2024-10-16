import planStore, {
    PlanItem as TPlanItem,
} from "@/features/Planner/data/planStore";
import LibraryStore from "../../RecipeLibrary/data/LibraryStore";
import type {
    Ingredient,
    IngredientRef,
    RecipeFromPlanItem,
} from "@/global/types/types";
import { RippedLO } from "@/util/ripLoadObject";
import { bfsIdEq, ensureString } from "@/global/types/identity";
import { PlanItemStatus } from "@/__generated__/graphql";

export const recipeRloFromItemRlo = (
    itemRlo: RippedLO<TPlanItem>,
): RippedLO<RecipeFromPlanItem> => {
    // if data is nullish, this cast is fine.
    if (!itemRlo.data)
        return itemRlo as unknown as RippedLO<RecipeFromPlanItem>;

    const subs: any[] = [];
    let loading = false;
    const computeKids = (item: TPlanItem): TPlanItem[] => {
        const subIds = item.subtaskIds || [];
        const subIdLookup = new Set<string>(subIds.map(ensureString));
        return subIds
            .concat(
                (item.componentIds || []).filter(
                    (id) => !subIdLookup.has(ensureString(id)),
                ),
            )
            .map((id) => planStore.getItemRlo(id))
            .filter((rlo) => {
                if (!rlo.data) {
                    loading = true;
                    return false;
                }
                return true;
            })
            .map((rlo) => rlo.data!);
    };
    const prepRecipe = (
        planItem: TPlanItem,
        rLO?: RippedLO<any>,
        ancestorCompleting = false,
        ancestorDeleting = false,
    ): RecipeFromPlanItem => {
        const completing = planItem._next_status === PlanItemStatus.Completed;
        const deleting = planItem._next_status === PlanItemStatus.Deleted;
        const recipe: RecipeFromPlanItem = {
            ...planItem,
            type: "Recipe",
            completing,
            deleting,
            ancestorCompleting,
            ancestorDeleting,
            ingredients: computeKids(planItem).map((kid) => {
                const ref: IngredientRef = {
                    ...kid,
                    raw: kid.name,
                };
                let recurse =
                    kid.subtaskIds != null && kid.subtaskIds.length > 0;
                let iRlo: RippedLO<Ingredient> | undefined;
                if (ref.ingredientId) {
                    iRlo = LibraryStore.getIngredientRloById(
                        ensureString(ref.ingredientId),
                    );
                    if (iRlo.loading) {
                        loading = true;
                    }
                    const ing = iRlo.data;
                    if (ing) {
                        ref.ingredient = ing;
                        recurse = recurse || ing.type === "Recipe";
                    }
                }
                if (recurse && subs.every((s) => !bfsIdEq(s.id, ref.id))) {
                    subs.push(
                        prepRecipe(
                            kid,
                            iRlo,
                            completing || ancestorCompleting,
                            deleting || ancestorDeleting,
                        ),
                    );
                }
                return ref;
            }),
        };
        if (planItem.notes) {
            // replace the recipe's directions
            recipe.directions = planItem.notes;
        }
        if (!planItem.ingredientId) return recipe;
        rLO = rLO || LibraryStore.getIngredientRloById(planItem.ingredientId);
        if (rLO.loading) {
            loading = true;
        }
        const r = rLO.data;
        if (!r) return recipe;
        Object.keys(r)
            .filter((k) => !recipe.hasOwnProperty(k))
            .forEach((k) => (recipe[k] = r[k]));
        recipe.libraryRecipeId = planItem.ingredientId || undefined;
        return recipe;
    };
    const recipe = prepRecipe(itemRlo.data);
    recipe.subrecipes = subs;
    return {
        ...itemRlo,
        data: recipe,
        loading,
    };
};
