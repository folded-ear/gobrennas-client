import useFluxStore from "data/useFluxStore";
import planStore from "features/Planner/data/planStore";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import React from "react";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { RouteComponentProps } from "react-router";
import { useLoadedPlan } from "features/RecipeDisplay/hooks/useLoadedPlan";
import { recipeLoByItemLo } from "features/RecipeDisplay/utils/recipeLoByItemLo";

type Props = RouteComponentProps<{
    pid: string
    rid: string
}>;

const PlannedRecipeController: React.FC<Props> = ({ match }) => {
    const rid = parseInt(match.params.rid, 10);
    const lo = useFluxStore(
        () => recipeLoByItemLo(planStore.getItemLO(rid)),
        [
            planStore,
            LibraryStore,
        ],
        [ rid ],
    );

    const pid = parseInt(match.params.pid, 10);
    useLoadedPlan(pid);

    if (lo.hasValue()) {
        return <RecipeDetail
            recipe={lo.getValueEnforcing()}
            subrecipes={lo.getValueEnforcing().subrecipes}
        />;
    }

    return <LoadingIndicator />;
};

export default PlannedRecipeController;
