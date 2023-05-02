import useActivePlanner from "data/useActivePlanner";
import useSynchronizer from "util/useSynchronizer";
import PlanApi from "./PlanApi";

function PlanItemSynchronizer() {
    const plan = useActivePlanner().data;
    const planId = plan
        ? plan.id
        : null;
    useSynchronizer(
        [ "plan", planId, "items" ],
        ts =>
            planId
                ? PlanApi.getItemsUpdatedSince(planId, ts)
                : Promise.resolve(),
    );
    return null;
}

export default PlanItemSynchronizer;
