import TaskStore from "./TaskStore";
import useFluxStore from "./useFluxStore";

const useActivePlannerLO = () => useFluxStore(
    () => TaskStore.getActiveListLO(),
    [TaskStore],
);

export default useActivePlannerLO;
