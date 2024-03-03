import useActivePlanner from "data/useActivePlanner";
import PlanApi from "./PlanApi";
import useActiveShoppingPlanIds from "../../../data/useActiveShoppingPlanIds";
import { useSynchronizers } from "../../../util/useSynchronizer";

function PlanItemSynchronizer() {
    let planIds = useActiveShoppingPlanIds();
    const plan = useActivePlanner().data;
    if (plan && plan.id != null && !planIds.includes(plan.id)) {
        planIds = planIds.concat(plan.id);
    }
    useSynchronizers(
        planIds.map((planId) => ({
            queryKey: ["plan", planId, "items"],
            queryFn: (ts) =>
                planId
                    ? PlanApi.getItemsUpdatedSince(planId, ts)
                    : Promise.resolve(),
        })),
    );
    return null;
}

export default PlanItemSynchronizer;
