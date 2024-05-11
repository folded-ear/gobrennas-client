import { gql } from "__generated__";
import useAdaptingQuery from "data/hooks/useAdaptingQuery";
import { GetPlansQuery } from "__generated__/graphql";
import { Plan } from "features/Planner/types";

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

const adapter = (data?: GetPlansQuery): Plan[] => {
    if (!data?.planner?.plans) return [];
    return data.planner.plans as Plan[];
};

export const useGetAllPlans = () => {
    return useAdaptingQuery(GET_PLANS, adapter, {
        fetchPolicy: "network-only",
    });
};
