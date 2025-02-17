import useAdaptingQuery from "@/data/hooks/useAdaptingQuery";
import { BfsId } from "@/global/types/identity";
import { useProfileId } from "@/providers/Profile";
import { zippedComparator } from "@/util/comparators";
import { gql } from "@/__generated__";
import { GetPlansQuery } from "@/__generated__/graphql";

export const GET_PLANS = gql(`
query getPlans {
  planner {
    plans {
      id
      name
      color
      owner {
        id
        name
      }
    }
  }
}
`);

const orderComponentsById = (
    plans: GetPlansQuery["planner"]["plans"],
    userId: string,
): Record<BfsId, string[]> => {
    const byId: Record<BfsId, string[]> = {};
    for (const plan of plans) {
        const ownerName =
            plan.owner.id === userId
                ? "" // me first!
                : plan.owner.name || "\u7fff";
        byId[plan.id] = [ownerName, plan.name];
    }
    return byId;
};

const adapter = (data?: GetPlansQuery) => {
    return data?.planner?.plans ?? [];
};

export const useGetAllPlans = () => {
    const userId = useProfileId();
    const result = useAdaptingQuery(GET_PLANS, adapter);
    const orderedPlans = orderComponentsById(result.data, userId);
    const plans = result.data
        .slice()
        .sort((a, b) =>
            zippedComparator(orderedPlans[a.id], orderedPlans[b.id]),
        );
    return {
        ...result,
        data: plans,
    };
};
