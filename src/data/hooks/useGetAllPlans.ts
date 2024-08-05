import { gql } from "@/__generated__";
import useAdaptingQuery from "@/data/hooks/useAdaptingQuery";
import { GetPlansQuery } from "@/__generated__/graphql";
import { Plan } from "@/features/Planner/types";
import { useProfileId } from "@/providers/Profile";
import { BfsId } from "@/global/types/identity";
import { zippedComparator } from "@/util/comparators";
import { ensureInt } from "@/global/utils";

export const GET_PLANS = gql(`
query getPlans {
  planner {
    plans {
      id
      name
      owner {
        id
        name
      }
    }
  }
}
`);

const orderComponentsById = (plans: Plan[], userId: BfsId) => {
    const byId = {};
    for (const plan of plans) {
        const ownerName =
            plan.owner.id.toString() === userId.toString()
                ? "" // me first!
                : plan.owner.name || "\u7fff";
        byId[plan.id] = [ownerName, plan.name];
    }
    return byId;
};

const adapter = (data?: GetPlansQuery): Plan[] => {
    if (!data?.planner?.plans) return [];
    return data.planner.plans as Plan[];
};

export const useGetAllPlans = () => {
    const userId = useProfileId();
    const result = useAdaptingQuery(GET_PLANS, adapter, {
        fetchPolicy: "network-only",
    });
    const orderedPlans = orderComponentsById(result.data, userId);
    const plans = result.data
        .slice()
        .sort((a, b) =>
            zippedComparator(orderedPlans[a.id], orderedPlans[b.id]),
        )
        .map((plan) => ({ ...plan, id: ensureInt(plan.id) }));

    return {
        ...result,
        data: plans,
    };
};
