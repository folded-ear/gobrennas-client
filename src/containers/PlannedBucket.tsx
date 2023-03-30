import useFluxStore from "data/useFluxStore";
import getBucketLabel from "features/Planner/components/getBucketLabel";
import TaskStore from "features/Planner/data/TaskStore";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import React from "react";
import LoadObject from "util/LoadObject";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "views/cook/RecipeDetail";
import {
    buildFullRecipeLO as buildSingleTaskRecipeLO,
    useLoadedPlan,
} from "./PlannedRecipe";
import { RouteComponentProps } from "react-router";

export const buildFullRecipeLO = (planId: number, bucketId: number): LoadObject<any> => {
    const plan = TaskStore.getTaskLO(planId);
    if (!plan.hasValue()) return plan;
    const bucket = plan.getValueEnforcing()
        .buckets
        .find(b => b.id === bucketId);
    if (!bucket) return LoadObject.empty();
    const items = TaskStore.getItemsInBucket(planId, bucketId);
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

type Props = RouteComponentProps<{
    pid: string
    bid: string
}>;

const PlannedBucket: React.FC<Props> = ({ match }) => {
    const pid = parseInt(match.params.pid, 10);
    const bid = parseInt(match.params.bid, 10);
    const lo = useFluxStore(
        () => buildFullRecipeLO(pid, bid),
        [
            TaskStore,
            LibraryStore,
        ],
        [ pid, bid ],
    );

    useLoadedPlan(pid);

    if (lo.hasValue()) {
        return <RecipeDetail
            recipeLO={lo}
            subrecipes={lo.getValueEnforcing().subrecipes}
            ownerLO={LoadObject.empty()}
        />;
    }

    return <LoadingIndicator />;
};

export default PlannedBucket;
