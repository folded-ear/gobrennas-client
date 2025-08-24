import useFluxStore from "@/data/useFluxStore";
import CookedItButton from "@/features/Planner/components/CookedItButton";
import planStore from "@/features/Planner/data/planStore";
import { useLoadedPlan } from "@/features/RecipeDisplay/hooks/useLoadedPlan";
import { recipeRloFromItemRlo } from "@/features/RecipeDisplay/utils/recipeRloFromItemRlo";
import LibraryStore from "@/features/RecipeLibrary/data/LibraryStore";
import CloseButton from "@/views/common/CloseButton";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import NotFound from "@/views/common/NotFound";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link, useHistory } from "react-router-dom";
import RecipeDetail from "./components/RecipeDetail";

type Props = RouteComponentProps<{
    pid: string;
    rid: string;
}>;

const PlannedRecipeController: React.FC<Props> = ({ match }) => {
    const rid = match.params.rid;
    const recipeRLO = useFluxStore(
        () => recipeRloFromItemRlo(planStore.getItemRlo(rid)),
        [planStore, LibraryStore],
        [rid],
    );
    const history = useHistory();

    useLoadedPlan(match.params.pid); // don't actually need the data, just need it loaded

    if (recipeRLO.error) {
        return (
            <NotFound>
                <Link to={`/plan/${match.params.pid}`}>Back to Plan</Link>
            </NotFound>
        );
    }

    const recipe = recipeRLO.data;
    if (!recipe) {
        return <LoadingIndicator />;
    }

    return (
        <RecipeDetail
            recipe={recipe}
            nav={
                <>
                    <CookedItButton recipe={recipe} />
                    <CloseButton
                        onClick={() =>
                            history.push(`/plan/${match.params.pid}`)
                        }
                    />
                </>
            }
        />
    );
};

export default PlannedRecipeController;
