import { gql } from "@/__generated__";

export const LOAD_PLANS = gql(`
query loadPlans {
  planner {
    plans {
      ...corePlanItemLoad
      ...planLoad
    }
  }
}`);

export const LOAD_DESCENDANTS = gql(`
query loadPlanItemAndDescendants($id: ID!) {
  planner {
    planOrItem(id: $id) {
      ...corePlanItemLoad
      ...planLoad
      ...planItemLoad
      descendants {
        ...corePlanItemLoad
        ...planItemLoad
      }
    }
  }
}`);

export const GET_PLAN_SHARE_INFO = gql(`
query getPlanShareInfo($id: ID!) {
  planner {
    plan(id: $id) {
      share {
        id
        slug
        secret
      }
    }
  }
}`);
