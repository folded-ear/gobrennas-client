import PropTypes from "prop-types";
import React from "react";
import LibraryStore from "../data/LibraryStore";
import TaskStore from "../data/TaskStore";
import useFluxStore from "../data/useFluxStore";
import LoadObject from "../util/LoadObject";
import LoadingIndicator from "../views/common/LoadingIndicator";
import RecipeDetail from "../views/cook/RecipeDetail";
import getBucketLabel from "../views/plan/getBucketLabel";
import {
    buildFullRecipeLO as buildSingleTaskRecipeLO,
    useLoadedPlan,
} from "./PlannedRecipe";

export const buildFullRecipeLO = (planId, bucketId) => {
    const plan = TaskStore.getTaskLO(planId);
    if (!plan.hasValue()) return plan;
    const bucket = plan.getValueEnforcing()
        .buckets
        .find(b => b.id === bucketId);
    if (!bucket) return LoadObject.empty();
    return buildSingleTaskRecipeLO(LoadObject.withValue({
        name: getBucketLabel(bucket),
        subtaskIds: TaskStore.getItemsInBucket(planId, bucketId)
            .map(it => it.id),
    }));
};

const PlannedBucket = ({match}) => {
    const pid = parseInt(match.params.pid, 10);
    const bid = parseInt(match.params.bid, 10);
    const lo = useFluxStore(
        () => buildFullRecipeLO(pid, bid),
        [
            TaskStore,
            LibraryStore,
        ],
        [pid, bid],
    );

    useLoadedPlan(pid);

    if (lo.hasValue()) {
        return <RecipeDetail
            anonymous
            recipeLO={lo}
            subrecipes={lo.getValueEnforcing().subrecipes}
            ownerLO={LoadObject.empty()}
        />;
    }

    return <LoadingIndicator />;
};

PlannedBucket.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            pid: PropTypes.string.isRequired,
            bid: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired
};

export default PlannedBucket;
