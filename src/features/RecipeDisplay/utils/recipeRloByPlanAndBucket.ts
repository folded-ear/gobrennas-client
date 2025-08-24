import { PlanItemStatus } from "@/__generated__/graphql";
import getBucketLabel from "@/features/Planner/components/getBucketLabel";
import planStore, { Plan } from "@/features/Planner/data/planStore";
import { recipeRloFromItemRlo as buildSingleItemRecipeLO } from "@/features/RecipeDisplay/utils/recipeRloFromItemRlo";
import { BfsId } from "@/global/types/identity";
import type { RecipeFromPlanItem } from "@/global/types/types";
import { mapData, RippedLO } from "@/util/ripLoadObject";

export const recipeRloByPlanAndBucket = (
    planId: BfsId,
    bucketId: BfsId,
): RippedLO<RecipeFromPlanItem> => {
    const planRLO = planStore.getItemRlo(planId);
    const plan = planRLO.data as Plan | undefined;
    if (!plan) {
        // no value means value's type is irrelevant
        return planRLO as unknown as RippedLO<RecipeFromPlanItem>;
    }
    const bucket = plan.buckets.find((b) => b.id === bucketId);
    if (!bucket) return {};
    const items = planStore.getItemsInBucket(planId, bucketId);
    if (items.length === 0) return {};
    if (items.length === 1) {
        return mapData(buildSingleItemRecipeLO({ data: items[0] }), (it) => ({
            ...it,
            name: `${it.name} (${getBucketLabel(bucket)})`,
        }));
    }
    return buildSingleItemRecipeLO({
        data: {
            id: bucket.id,
            status: PlanItemStatus.NEEDED,
            name: getBucketLabel(bucket),
            componentIds: items.map((it) => it.id),
        },
    });
};
