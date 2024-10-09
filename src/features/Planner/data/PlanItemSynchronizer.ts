import useActivePlanner from "@/data/useActivePlanner";
import useActiveShoppingPlanIds from "@/data/useActiveShoppingPlanIds";
import { useSynchronizers } from "@/util/useSynchronizer";
import PlanApi from "@/features/Planner/data/PlanApi";
import ClientId from "@/util/ClientId";

export default function PlanItemSynchronizer() {
    let planIds = useActiveShoppingPlanIds();
    const plan = useActivePlanner().data;
    if (plan?.id != null && !planIds.includes(plan.id)) {
        planIds = planIds.concat(plan.id);
    }
    useSynchronizers(
        planIds
            .filter((id) => id != null && !ClientId.is(id))
            .map((planId) => ({
                queryKey: ["plan", planId, "items"],
                queryFn: (ts: number) =>
                    PlanApi.getItemsUpdatedSince(planId, ts),
            })),
    );
    return null;
}
