import useFluxStore from "data/useFluxStore";
import planStore from "features/Planner/data/planStore";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import React from "react";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { RouteComponentProps } from "react-router";
import { useLoadedPlan } from "features/RecipeDisplay/hooks/useLoadedPlan";
import { recipeLoByItemLo } from "features/RecipeDisplay/utils/recipeLoByItemLo";
import CloseButton from "../../views/common/CloseButton";
import history from "../../util/history";
import CookedItButton from "features/Planner/components/CookedItButton";
import { ripLoadObject } from "../../util/ripLoadObject";

type Props = RouteComponentProps<{
    pid: string;
    rid: string;
}>;

const PlannedRecipeController: React.FC<Props> = ({ match }) => {
    const rid = parseInt(match.params.rid, 10);
    const recipe = useFluxStore(
        () => ripLoadObject(recipeLoByItemLo(planStore.getItemLO(rid))).data,
        [planStore, LibraryStore],
        [rid],
    );

    useLoadedPlan(match.params.pid); // don't actually need the data, just need it loaded

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
