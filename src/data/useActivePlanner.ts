import planStore from "features/Planner/data/planStore";
import useFluxStore from "./useFluxStore";
import { ripLoadObject } from "util/ripLoadObject";

function useActivePlanner() {
    return useFluxStore(
        () => ripLoadObject(planStore.getActivePlanLO()),
        [planStore],
    );
}

export default useActivePlanner;
