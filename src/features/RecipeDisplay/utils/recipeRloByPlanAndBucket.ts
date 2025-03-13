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
    return mapData(
        buildSingleItemRecipeLO({
            data: {
                id: bucket.id,
                status: PlanItemStatus.NEEDED,
                name: getBucketLabel(bucket),
                componentIds: items.map((it) => it.id),
            },
        }),
        (r) => {
            const idToIdx = new Map<string, number>();
            items.forEach((it, i) => idToIdx.set(it.id, i));
            const itToSubIdx = new Map<RecipeFromPlanItem, number>();
            if (!r.subrecipes) {
                throw new Error("No subrecipes?!");
            }
            r.subrecipes.forEach((it) =>
                itToSubIdx.set(it, idToIdx.get(it.id) ?? -1),
            );
            const recipeWithPhoto = r.subrecipes
                .slice()
                .sort((a, b) => {
                    const ai = itToSubIdx.get(a)!;
                    const bi = itToSubIdx.get(b)!;
                    if (ai >= 0 && bi < 0) return -1;
                    if (ai < 0 && bi >= 0) return +1;
                    return 0;
                })
                .find((it) => it.photo);
            return recipeWithPhoto
                ? {
                      ...r,
                      photo: recipeWithPhoto.photo,
                      photoFocus: recipeWithPhoto.photoFocus,
                  }
                : r;
        },
    );
};
