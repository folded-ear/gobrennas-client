import useFluxStore from "@/data/useFluxStore";
import planStore from "@/features/Planner/data/planStore";
import LibraryStore from "@/features/RecipeLibrary/data/LibraryStore";
import React from "react";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { RouteComponentProps } from "react-router";
import { useLoadedPlan } from "@/features/RecipeDisplay/hooks/useLoadedPlan";
import { recipeRloFromItemRlo } from "@/features/RecipeDisplay/utils/recipeRloFromItemRlo";
import CloseButton from "@/views/common/CloseButton";
import CookedItButton from "@/features/Planner/components/CookedItButton";
import { Link, useHistory } from "react-router-dom";
import NotFound from "@/views/common/NotFound";

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
            subrecipes={recipe.subrecipes}
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
