import useFluxStore from "@/data/useFluxStore";
import planStore from "@/features/Planner/data/planStore";
import React from "react";
import dispatcher from "@/data/dispatcher";
import PlanActions from "@/features/Planner/data/PlanActions";
import { BfsId, includesBfsId } from "@/global/types/identity";
import { useHistory } from "react-router-dom";

export const useLoadedPlan = (pid: BfsId | undefined) => {
    const history = useHistory();
    // ensure it's loaded
    const allPlanIds = useFluxStore(
        () => planStore.getPlanIdsRlo(),
        [planStore],
    ).data;
    // ensure it's selected
    React.useEffect(() => {
        if (pid != null && allPlanIds && allPlanIds.length) {
            if (!includesBfsId(allPlanIds, pid)) {
                // Deleted; navigate to the first still-present plan.
                history.push(`/plan/${allPlanIds[0]}`);
            } else {
                // The contract implies that effects trigger after the render
                // cycle completes, but doesn't guarantee it. The setTimeout
                // avoids a reentrant dispatch if the effect isn't deferred.
                const t = setTimeout(() =>
                    dispatcher.dispatch({
                        type: PlanActions.SELECT_PLAN,
                        id: pid,
                    }),
                );
                return () => clearTimeout(t);
            }
        }
    }, [history, allPlanIds, pid]);
};
