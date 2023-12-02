import useFluxStore from "data/useFluxStore";
import planStore from "features/Planner/data/planStore";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import React from "react";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { RouteComponentProps } from "react-router";
import { useLoadedPlan } from "features/RecipeDisplay/hooks/useLoadedPlan";
import { recipeLoByItemAndBucket } from "features/RecipeDisplay/utils/recipeLoByItemAndBucket";
import CloseButton from "../../views/common/CloseButton";
import history from "../../util/history";

type Props = RouteComponentProps<{
    pid: string;
    bid: string;
}>;

const PlannedBucketController: React.FC<Props> = ({ match }) => {
    const pid = parseInt(match.params.pid, 10);
    const bid = parseInt(match.params.bid, 10);
    const lo = useFluxStore(
        () => recipeLoByItemAndBucket(pid, bid),
        [planStore, LibraryStore],
        [pid, bid],
    );

    useLoadedPlan(pid);

    if (lo.hasValue()) {
        return (
            <RecipeDetail
                recipe={lo.getValueEnforcing()}
                subrecipes={lo.getValueEnforcing().subrecipes}
                nav={
                    <>
                        <CloseButton
                            onClick={() => history.push(`/plan/${pid}`)}
                        />
                    </>
                }
            />
        );
    }

    return <LoadingIndicator />;
};

export default PlannedBucketController;
