import useFluxStore from "data/useFluxStore";
import TaskStore from "features/Planner/data/TaskStore";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import React from "react";
import LoadObject from "util/LoadObject";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { RouteComponentProps } from "react-router";
import { useLoadedPlan } from "features/RecipeDisplay/hooks/useLoadedPlan";
import { recipeLoByItemAndBucket } from "features/RecipeDisplay/utils/recipeLoByItemAndBucket";

type Props = RouteComponentProps<{
    pid: string
    bid: string
}>;

const PlannedBucketController: React.FC<Props> = ({ match }) => {
    const pid = parseInt(match.params.pid, 10);
    const bid = parseInt(match.params.bid, 10);
    const lo = useFluxStore(
        () => recipeLoByItemAndBucket(pid, bid),
        [
            TaskStore,
            LibraryStore,
        ],
        [ pid, bid ],
    );

    useLoadedPlan(pid);

    if (lo.hasValue()) {
        return <RecipeDetail
            recipe={lo.getValueEnforcing()}
            subrecipes={lo.getValueEnforcing().subrecipes}
            ownerLO={LoadObject.empty()}
        />;
    }

    return <LoadingIndicator />;
};

export default PlannedBucketController;
