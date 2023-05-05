import LoadObject from "util/LoadObject";
import { RecipeFromTask } from "features/RecipeDisplay/types";
import planStore from "features/Planner/data/planStore";
import { recipeLoByItemLo as buildSingleTaskRecipeLO } from "features/RecipeDisplay/utils/recipeLoByItemLo";
import getBucketLabel from "features/Planner/components/getBucketLabel";

export const recipeLoByItemAndBucket = (planId: number, bucketId: number): LoadObject<RecipeFromTask> => {
    const plan = planStore.getItemLO(planId);
    if (!plan.hasValue()) {
        // no value means value's type is irrelevant
        return plan as LoadObject<any>;
    }
    const bucket = plan.getValueEnforcing()
        .buckets
        .find(b => b.id === bucketId);
    if (!bucket) return LoadObject.empty();
    const items = planStore.getItemsInBucket(planId, bucketId);
    if (items.length === 0) return LoadObject.empty();
    if (items.length === 1) {
        return buildSingleTaskRecipeLO(LoadObject.withValue(items[0]))
            .map(it => ({
                ...it,
                name: `${it.name} (${getBucketLabel(bucket)})`,
            }));
    }
    return buildSingleTaskRecipeLO(LoadObject.withValue({
        name: getBucketLabel(bucket),
        subtaskIds: items.map(it => it.id),
    })).map(r => {
        const idToIdx = new Map();
        r.subtaskIds.forEach((id, i) => idToIdx.set(id, i));
        const itToSubIdx = new Map();
        r.subrecipes.forEach(it => itToSubIdx.set(it, idToIdx.has(it.id) ? idToIdx.get(it.id) : -1));
        const withPhoto = r.subrecipes.slice().sort((a, b) => {
            const ai = itToSubIdx.get(a);
            const bi = itToSubIdx.get(b);
            if (ai >= 0 && bi < 0) return -1;
            if (ai < 0 && bi >= 0) return +1;
            return 0;
        }).find(it => it.photo);
        return withPhoto ? {
            ...r,
            photo: withPhoto.photo,
            photoFocus: withPhoto.photoFocus,
        } : r;
    });
};
