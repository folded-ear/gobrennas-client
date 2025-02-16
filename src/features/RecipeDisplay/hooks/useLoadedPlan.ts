import dispatcher, { ActionType } from "@/data/dispatcher";
import useFluxStore from "@/data/useFluxStore";
import planStore from "@/features/Planner/data/planStore";
import { BfsId, includesBfsId } from "@/global/types/identity";
import * as React from "react";
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
                        type: ActionType.PLAN__SELECT_PLAN,
                        id: pid,
                    }),
                );
                return () => clearTimeout(t);
            }
        }
    }, [history, allPlanIds, pid]);
};
