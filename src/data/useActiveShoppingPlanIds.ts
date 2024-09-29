import useFluxStore from "./useFluxStore";
import shoppingStore from "./shoppingStore";
import planStore from "@/features/Planner/data/planStore";

function useActiveShoppingPlanIds() {
    return useFluxStore(() => {
        const ids = shoppingStore.getActivePlanIds();
        if (ids != null && ids.length > 0) return ids;
        const activePlan = planStore.getActivePlanRlo().data;
        if (activePlan && activePlan.id != null) return [activePlan?.id];
        return [];
    }, [planStore, shoppingStore]);
}

export default useActiveShoppingPlanIds;
