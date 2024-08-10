import useActivePlanner from "@/data/useActivePlanner";
import useActiveShoppingPlanIds from "@/data/useActiveShoppingPlanIds";
import { useSynchronizers } from "@/util/useSynchronizer";
import TaskApi from "./TaskApi";
import ClientId from "@/util/ClientId";

function PlanItemSynchronizer() {
    let planIds = useActiveShoppingPlanIds();
    const plan = useActivePlanner().data;
    if (plan?.id != null && !planIds.includes(plan.id)) {
        planIds = planIds.concat(plan.id);
    }
    useSynchronizers(
        planIds
            .filter((id) => !ClientId.is(id))
            .map((planId) => ({
                queryKey: ["plan", planId, "items"],
                queryFn: (ts) =>
                    planId
                        ? TaskApi.getItemsUpdatedSince(planId, ts)
                        : Promise.resolve(),
            })),
    );
    return null;
}

export default PlanItemSynchronizer;
