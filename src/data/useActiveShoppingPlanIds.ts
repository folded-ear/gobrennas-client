import useFluxStore from "./useFluxStore";
import shoppingStore from "./shoppingStore";
import planStore from "@/features/Planner/data/planStore";

function useActiveShoppingPlanIds() {
    return useFluxStore(() => {
        const ids = shoppingStore.getActivePlanIds();
        if (ids != null && ids.length > 0) return ids;
        return [planStore.getActivePlanRlo().data?.id];
    }, [planStore, shoppingStore]);
}

export default useActiveShoppingPlanIds;
