import TaskStore from "features/Planner/data/TaskStore";
import useFluxStore from "./useFluxStore";

const useActivePlannerLO = () => useFluxStore(
    () => TaskStore.getActiveListLO(),
    [TaskStore],
);

export default useActivePlannerLO;
