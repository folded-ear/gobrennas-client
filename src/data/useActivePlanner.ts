import TaskStore from "features/Planner/data/planStore";
import useFluxStore from "./useFluxStore";
import { ripLoadObject } from "util/ripLoadObject";

function useActivePlanner() {
    return useFluxStore(
        () => ripLoadObject(TaskStore.getActiveListLO()),
        [ TaskStore ],
    );
}

export default useActivePlanner;
