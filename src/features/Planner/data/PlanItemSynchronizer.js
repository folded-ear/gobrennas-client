import useActivePlannerLO from "data/useActivePlannerLO";
import useSynchronizer from "util/useSynchronizer";
import { ripLoadObject } from "../../../util/loadObjectTypes";
import PlanApi from "./PlanApi";

function PlanItemSynchronizer() {
    const plan = ripLoadObject(useActivePlannerLO()).data;
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
