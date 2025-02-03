import { gql } from "@/__generated__";

export const SEND_RECIPE_TO_PLAN = gql(`
mutation sendRecipeToPlan($id: ID!, $planId: ID!, $scale: Float = 1) {
  library {
    sendRecipeToPlan(id: $id, planId: $planId, scale: $scale) {
      ...corePlanItemLoad
      ...planItemLoad
      parent {
        ...corePlanItemLoad
        ...planLoad
        ...planItemLoad
      }
      descendants {
        ...corePlanItemLoad
        ...planItemLoad
      }
    }
  }
}`);

export const CREATE_TEXTRACT_JOB = gql(`
mutation createTextractJob($photo: Upload!) {
  textract {
    createJob(photo: $photo) {
      id
      photo {
        url
        filename
      }
      ready
    }
  }
}`);

export const DELETE_TEXTRACT_JOB = gql(`
mutation deleteTextractJob($id: ID!) {
  textract {
    deleteJob(id: $id) { id }
  }
}`);
