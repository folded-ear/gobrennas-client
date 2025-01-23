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

export const GET_UPDATED_SINCE = gql(`
query planItemsUpdatedSince(
  $planId: ID!,
  $cutoff: Long!
) {
  planner {
    updatedSince(planId: $planId, cutoff: $cutoff) {
      ...corePlanItemLoad
      ...planLoad
      ...planItemLoad
    }
  }
}`);
