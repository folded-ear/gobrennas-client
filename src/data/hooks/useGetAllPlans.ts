import { gql } from "__generated__";
import useAdaptingQuery from "data/hooks/useAdaptingQuery";
import { GetPlansQuery } from "__generated__/graphql";
import { Plan } from "features/Planner/types";
import { useProfileId } from "providers/Profile";
import { BfsId } from "global/types/identity";
import { zippedComparator } from "util/comparators";

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
    return plans.reduce((byId, plan) => {
        let ownerId = plan.owner.id || Number.MAX_SAFE_INTEGER;
        const ownerName = plan.owner.name || "";

        if (ownerId === userId) {
            ownerId = -1;
        }
        byId[plan.id] = [ownerId, ownerName, plan.name];
        return byId;
    }, {});
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
        ) as Plan[];

    return {
        ...result,
        data: plans,
    };
};
