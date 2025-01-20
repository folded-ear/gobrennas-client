import { gql } from "@/__generated__";

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
