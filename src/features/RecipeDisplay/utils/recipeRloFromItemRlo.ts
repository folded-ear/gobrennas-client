import { PlanItemStatus } from "@/__generated__/graphql";
import planStore, {
    PlanItem as TPlanItem,
} from "@/features/Planner/data/planStore";
import { BfsId } from "@/global/types/identity";
import type {
    Ingredient,
    IngredientRef,
    RecipeFromPlanItem,
    SectionWithPhoto,
} from "@/global/types/types";
import { RippedLO } from "@/util/ripLoadObject";
import LibraryStore from "../../RecipeLibrary/data/LibraryStore";

type OrphanPlanItem = Omit<TPlanItem, "parentId">;

export const recipeRloFromItemRlo = (
    itemRlo: RippedLO<OrphanPlanItem>,
): RippedLO<RecipeFromPlanItem> => {
    // if data is nullish, this cast is fine.
    if (itemRlo.data == null)
        return itemRlo as unknown as RippedLO<RecipeFromPlanItem>;

    // If components are shuffled around, we can end up visiting a given item
    // as both a component and a descendant, but only want it to appear once.
    // Note that if recipe is present multiple times, all instances need to be
    // present, as they may have undergone distinct mods on the plan. The user's
    // going to have to do some work to figure out which one goes with what, but
    // we already know they're smart - they use BFS!
    const visitedItemIds = new Set<BfsId>();
    const sections: SectionWithPhoto[] = [];
    let loading = false;
    const computeKids = (item: OrphanPlanItem): TPlanItem[] => {
        const subIds = item.subtaskIds || [];
        const subIdLookup = new Set<string>(subIds);
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
            .map((rlo) => rlo.data!);
    };
    const prepRecipe = (
        planItem: OrphanPlanItem,
        rLO?: RippedLO<TPlanItem | Ingredient>,
        ancestorCompleting = false,
        ancestorDeleting = false,
    ): RecipeFromPlanItem => {
        const completing = planItem._next_status === PlanItemStatus.COMPLETED;
        const deleting = planItem._next_status === PlanItemStatus.DELETED;
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
                if (recurse && !visitedItemIds.has(kid.id)) {
                    visitedItemIds.add(kid.id);
                    const idx = sections.length;
                    const sub = prepRecipe(
                        kid,
                        iRlo,
                        completing || ancestorCompleting,
                        deleting || ancestorDeleting,
                    );
                    sections.splice(idx, 0, sub);
                }
                return ref;
            }),
            sections: [],
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
        return {
            ...r,
            ...recipe,
            // Typescript can't figure this out from the order of the spreads
            // for whatever reason. So do it manually.
            type: recipe.type,
            libraryRecipeId: planItem.ingredientId || undefined,
        };
    };
    const recipe = prepRecipe(itemRlo.data);
    recipe.sections = sections;
    return {
        ...itemRlo,
        data: recipe,
        loading,
    };
};
