import planStore from "features/Planner/data/planStore";
import useFluxStore from "./useFluxStore";

function useActivePlanner() {
    return useFluxStore(() => planStore.getActivePlanRlo(), [planStore]);
}

export default useActivePlanner;
