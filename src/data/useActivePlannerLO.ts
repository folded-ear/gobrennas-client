import TaskStore from "features/Planner/data/TaskStore";
import useFluxStore from "./useFluxStore";

function useActivePlannerLO() {
    return useFluxStore(
        () => TaskStore.getActiveListLO(),
        [ TaskStore ],
    );
}

export default useActivePlannerLO;
