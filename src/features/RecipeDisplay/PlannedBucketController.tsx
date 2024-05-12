import useFluxStore from "data/useFluxStore";
import planStore from "features/Planner/data/planStore";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import React from "react";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { RouteComponentProps } from "react-router";
import { useLoadedPlan } from "features/RecipeDisplay/hooks/useLoadedPlan";
import { recipeRloByPlanAndBucket } from "features/RecipeDisplay/utils/recipeRloByPlanAndBucket";
import CloseButton from "../../views/common/CloseButton";
import history from "../../util/history";
import CookedItButton from "features/Planner/components/CookedItButton";

type Props = RouteComponentProps<{
    pid: string;
    bid: string;
}>;

const PlannedBucketController: React.FC<Props> = ({ match }) => {
    const pid = parseInt(match.params.pid, 10);
    const bid = parseInt(match.params.bid, 10);
    const recipe = useFluxStore(
        () => recipeRloByPlanAndBucket(pid, bid).data,
        [planStore, LibraryStore],
        [pid, bid],
    );

    useLoadedPlan(pid); // don't actually need the data, just need it loaded

    if (!recipe) {
        return <LoadingIndicator />;
    }

    return (
        <RecipeDetail
            recipe={recipe}
            subrecipes={recipe.subrecipes}
            nav={
                <>
                    {recipe.libraryRecipeId != null && (
                        // only if the bucket is a single recipe
                        <CookedItButton recipe={recipe} />
                    )}
                    <CloseButton onClick={() => history.push(`/plan/${pid}`)} />
                </>
            }
        />
    );
};

export default PlannedBucketController;
