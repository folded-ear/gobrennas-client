import useFluxStore from "../../../data/useFluxStore";
import TaskStore from "../../Planner/data/TaskStore";
import React from "react";
import Dispatcher from "../../../data/dispatcher";
import PlanActions from "features/Planner/data/PlanActions";

export const useLoadedPlan = (pid: number) => {
    // ensure it's loaded
    const allPlansLO = useFluxStore(
        () => TaskStore.getListIdsLO(),
        [
            TaskStore,
        ],
    );
    // ensure it's selected
    React.useEffect(
        () => {
            if (allPlansLO.hasValue()) {
                // The contract implies that effects trigger after the render
                // cycle completes, but doesn't guarantee it. The setTimeout
                // avoids a reentrant dispatch if the effect isn't deferred.
                setTimeout(() => Dispatcher.dispatch({
                    type: PlanActions.SELECT_PLAN,
                    id: pid,
                }));
            }
        },
        [ allPlansLO, pid ],
    );
};
