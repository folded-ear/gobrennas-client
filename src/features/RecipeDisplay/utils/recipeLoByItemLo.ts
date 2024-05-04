import LoadObject from "../../../util/LoadObject";
import planStore from "features/Planner/data/planStore";
import LibraryStore from "../../RecipeLibrary/data/LibraryStore";
import type { RecipeFromPlanItem } from "global/types/types";
import PlanItemStatus from "../../Planner/data/PlanItemStatus";

export const recipeLoByItemLo = (
    itemLO: LoadObject<any>,
): LoadObject<RecipeFromPlanItem> => {
    let lo = itemLO;
    if (!lo.hasValue()) return lo;

    const subs: any[] = [];
    let loading = false;
    const computeKids = (item) => {
        const subIds = item.subtaskIds || [];
        const subIdLookup = new Set(subIds);
        return subIds
            .concat(
                (item.componentIds || []).filter((id) => !subIdLookup.has(id)),
            )
            .map((id) => planStore.getItemLO(id))
            .filter((lo) => {
                if (!lo.hasValue()) {
                    loading = true;
                    return false;
                }
                return true;
            })
            .map((lo) => lo.getValueEnforcing());
    };
    const prepRecipe = (
        item,
        rLO?: LoadObject<any>,
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
                let iLO;
                if (ref.ingredientId) {
                    iLO = LibraryStore.getIngredientById(ref.ingredientId);
                    if (iLO.isLoading()) {
                        loading = true;
                    }
                    if (iLO.hasValue()) {
                        const ing = iLO.getValueEnforcing();
                        ref.ingredient = ing;
                        recurse = recurse || ing.type === "Recipe";
                    }
                }
                if (recurse && subs.every((s) => s.id !== ref.id)) {
                    subs.push(
                        prepRecipe(
                            ref,
                            iLO,
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
        rLO =
            rLO ||
            (LibraryStore.getIngredientById(
                item.ingredientId,
            ) as LoadObject<any>);
        if (rLO.isLoading()) {
            loading = true;
        }
        if (!rLO.hasValue()) return item;
        const r = rLO.getValueEnforcing();
        Object.keys(r)
            .filter((k) => !item.hasOwnProperty(k))
            .forEach((k) => (item[k] = r[k]));
        item.libraryRecipeId = item.ingredientId || undefined;
        return item;
    };
    const recipe = prepRecipe(lo.getValueEnforcing());
    recipe.subrecipes = subs;
    lo = LoadObject.withValue(recipe);
    if (loading) {
        lo = lo.loading();
    }
    return lo;
};
