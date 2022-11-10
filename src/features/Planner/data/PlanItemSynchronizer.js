import Dispatcher from "../../../data/dispatcher";
import PlanApi from "./PlanApi";
import TaskActions from "./TaskActions";
import useSynchronizer from "../../../util/useSynchronizer";

function PlanItemSynchronizer({ planId }) {
    useSynchronizer(
        [ "plan", planId, "items" ],
        ts =>
            PlanApi.getItemsUpdatedSince(planId, ts)
                .then(data => data.data)
                .then(data => {
                    if (!data) return;
                    if (data.length === 0) return;
                    Dispatcher.dispatch({
                        type: TaskActions.LIST_DELTAS,
                        id: planId,
                        data,
                    });
                }),
    );
    return null;
}

export default PlanItemSynchronizer;
