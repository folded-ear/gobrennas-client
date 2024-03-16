import useFluxStore from "../../../data/useFluxStore";
import planStore from "features/Planner/data/planStore";
import React from "react";
import Dispatcher from "../../../data/dispatcher";
import PlanActions from "features/Planner/data/PlanActions";
import { BfsId } from "global/types/identity";

export const useLoadedPlan = (pid: BfsId | undefined) => {
    // ensure it's loaded
    const allPlansLO = useFluxStore(
        () => planStore.getPlanIdsLO(),
        [planStore],
    );
    // ensure it's selected
    React.useEffect(() => {
        if (pid != null && allPlansLO.hasValue()) {
            // The contract implies that effects trigger after the render
            // cycle completes, but doesn't guarantee it. The setTimeout
            // avoids a reentrant dispatch if the effect isn't deferred.
            setTimeout(() =>
                Dispatcher.dispatch({
                    type: PlanActions.SELECT_PLAN,
                    id: typeof pid === "string" ? parseInt(pid, 10) : pid,
                }),
            );
        }
    }, [allPlansLO, pid]);
};
