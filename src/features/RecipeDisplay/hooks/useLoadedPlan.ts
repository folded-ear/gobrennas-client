import useFluxStore from "@/data/useFluxStore";
import planStore from "@/features/Planner/data/planStore";
import React from "react";
import Dispatcher from "@/data/dispatcher";
import PlanActions from "@/features/Planner/data/PlanActions";
import { BfsId } from "@/global/types/identity";
import { ensureInt } from "@/global/utils";
import { useHistory } from "react-router-dom";

export const useLoadedPlan = (pid: BfsId | undefined) => {
    const history = useHistory();
    // ensure it's loaded
    const allPlansRlo = useFluxStore(
        () => planStore.getPlanIdsRlo(),
        [planStore],
    );
    // ensure it's selected
    React.useEffect(() => {
        if (pid != null && allPlansRlo?.data && allPlansRlo.data.length) {
            const id = ensureInt(pid);
            if (!allPlansRlo.data.includes(id)) {
                // Deleted; navigate to the first still-present plan.
                history.push(`/plan/${allPlansRlo.data[0]}`);
            } else {
                // The contract implies that effects trigger after the render
                // cycle completes, but doesn't guarantee it. The setTimeout
                // avoids a reentrant dispatch if the effect isn't deferred.
                const t = setTimeout(() =>
                    Dispatcher.dispatch({
                        type: PlanActions.SELECT_PLAN,
                        id,
                    }),
                );
                return () => clearTimeout(t);
            }
        }
    }, [history, allPlansRlo?.data, pid]);
};
