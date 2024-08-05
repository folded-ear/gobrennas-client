import useFluxStore from "@/data/useFluxStore";
import planStore from "@/features/Planner/data/planStore";
import React from "react";
import Dispatcher from "@/data/dispatcher";
import PlanActions from "@/features/Planner/data/PlanActions";
import { BfsId } from "@/global/types/identity";
import { ensureInt } from "@/global/utils";

export const useLoadedPlan = (pid: BfsId | undefined) => {
    // ensure it's loaded
    const allPlansRlo = useFluxStore(
        () => planStore.getPlanIdsRlo(),
        [planStore],
    );
    // ensure it's selected
    React.useEffect(() => {
        if (pid != null && allPlansRlo?.data) {
            // The contract implies that effects trigger after the render
            // cycle completes, but doesn't guarantee it. The setTimeout
            // avoids a reentrant dispatch if the effect isn't deferred.
            const t = setTimeout(() =>
                Dispatcher.dispatch({
                    type: PlanActions.SELECT_PLAN,
                    id: ensureInt(pid),
                }),
            );
            return () => clearTimeout(t);
        }
    }, [allPlansRlo?.data, pid]);
};
