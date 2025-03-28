import useFluxStore from "@/data/useFluxStore";
import CookedItButton from "@/features/Planner/components/CookedItButton";
import planStore from "@/features/Planner/data/planStore";
import { useLoadedPlan } from "@/features/RecipeDisplay/hooks/useLoadedPlan";
import { recipeRloByPlanAndBucket } from "@/features/RecipeDisplay/utils/recipeRloByPlanAndBucket";
import LibraryStore from "@/features/RecipeLibrary/data/LibraryStore";
import CloseButton from "@/views/common/CloseButton";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import RecipeDetail from "./components/RecipeDetail";

type Props = RouteComponentProps<{
    pid: string;
    bid: string;
}>;

const PlannedBucketController: React.FC<Props> = ({ match }) => {
    const pid = match.params.pid;
    const bid = match.params.bid;
    const recipe = useFluxStore(
        () => recipeRloByPlanAndBucket(pid, bid).data,
        [planStore, LibraryStore],
        [pid, bid],
    );
    const history = useHistory();

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
