import LoadObject from "util/LoadObject";
import type { RecipeFromPlanItem } from "global/types/types";
import planStore from "features/Planner/data/planStore";
import { recipeLoByItemLo as buildSingleItemRecipeLO } from "features/RecipeDisplay/utils/recipeLoByItemLo";
import getBucketLabel from "features/Planner/components/getBucketLabel";

export const recipeLoByItemAndBucket = (
    planId: number,
    bucketId: number,
): LoadObject<RecipeFromPlanItem> => {
    const plan = planStore.getItemLO(planId);
    if (!plan.hasValue()) {
        // no value means value's type is irrelevant
        return plan as LoadObject<any>;
    }
    const bucket = plan
        .getValueEnforcing()
        .buckets.find((b) => b.id === bucketId);
    if (!bucket) return LoadObject.empty();
    const items = planStore.getItemsInBucket(planId, bucketId);
    if (items.length === 0) return LoadObject.empty();
    if (items.length === 1) {
        return buildSingleItemRecipeLO(LoadObject.withValue(items[0])).map(
            (it) => ({
                ...it,
                name: `${it.name} (${getBucketLabel(bucket)})`,
            }),
        );
    }
    return buildSingleItemRecipeLO(
        LoadObject.withValue({
            name: getBucketLabel(bucket),
            componentIds: items.map((it) => it.id),
        }),
    ).map((r) => {
        const idToIdx = new Map();
        items.forEach((it, i) => idToIdx.set(it.id, i));
        const itToSubIdx = new Map();
        r.subrecipes.forEach((it) =>
            itToSubIdx.set(it, idToIdx.has(it.id) ? idToIdx.get(it.id) : -1),
        );
        const recipeWithPhoto = r.subrecipes
            .slice()
            .sort((a, b) => {
                const ai = itToSubIdx.get(a);
                const bi = itToSubIdx.get(b);
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
    });
};
