import PlanApi from "./PlanApi";
import useSynchronizer from "util/useSynchronizer";
import useActivePlannerLO from "data/useActivePlannerLO";

function PlanItemSynchronizer() {
    const lo = useActivePlannerLO();
    const planId = lo.hasValue()
        ? lo.getValueEnforcing().id
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
