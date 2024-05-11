import type { RecipeFromPlanItem } from "global/types/types";
import planStore from "features/Planner/data/planStore";
import { recipeRloFromItemRlo as buildSingleItemRecipeLO } from "features/RecipeDisplay/utils/recipeRloFromItemRlo";
import getBucketLabel from "features/Planner/components/getBucketLabel";
import {
    emptyRLO,
    mapData,
    ripLoadObject,
    RippedLO,
} from "../../../util/ripLoadObject";

export const recipeRloByPlanAndBucket = (
    planId: number,
    bucketId: number,
): RippedLO<RecipeFromPlanItem> => {
    const planRLO = ripLoadObject(planStore.getItemLO(planId));
    const plan = planRLO.data;
    if (!plan) {
        // no value means value's type is irrelevant
        return planRLO as RippedLO<any>;
    }
    const bucket = plan.buckets.find((b) => b.id === bucketId);
    if (!bucket) return emptyRLO();
    const items = planStore.getItemsInBucket(planId, bucketId);
    if (items.length === 0) return emptyRLO();
    if (items.length === 1) {
        return mapData(buildSingleItemRecipeLO({ data: items[0] }), (it) => ({
            ...it,
            name: `${it.name} (${getBucketLabel(bucket)})`,
        }));
    }
    return mapData(
        buildSingleItemRecipeLO({
            data: {
                name: getBucketLabel(bucket),
                componentIds: items.map((it) => it.id),
            },
        }),
        (r) => {
            const idToIdx = new Map();
            items.forEach((it, i) => idToIdx.set(it.id, i));
            const itToSubIdx = new Map();
            r.subrecipes.forEach((it) =>
                itToSubIdx.set(
                    it,
                    idToIdx.has(it.id) ? idToIdx.get(it.id) : -1,
                ),
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
        },
    );
};
