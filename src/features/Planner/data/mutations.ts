import { gql } from "@/__generated__";

export const RENAME_PLAN_OR_ITEM = gql(`
mutation renamePlanOrItem($id: ID!, $name: String!) {
  planner {
    rename(id: $id, name: $name) {
      ...corePlanItemLoad
      ...planLoad
      ...planItemLoad
    }
  }
}`);

export const SET_PLAN_COLOR = gql(`
mutation setPlanColor($id: ID!, $color: String!) {
  planner {
    setColor(planId: $id, color: $color) {
      ...corePlanItemLoad
      ...planLoad
    }
  }
}`);

export const DELETE_PLAN_ITEM = gql(`
mutation deletePlanItem($id: ID!) {
  planner {
    deleteItem(id: $id) { id }
  }
}`);

export const CREATE_PLAN = gql(`
mutation createPlan($name: String!, $sourcePlanId: ID) {
  planner {
    createPlan(name: $name, sourcePlanId: $sourcePlanId) {
      ...corePlanItemLoad
      ...planLoad
    }
  }
}`);

export const CREATE_BUCKET = gql(`
mutation createBucket($planId: ID!, $name: String, $date: Date ) {
  planner {
    createBucket(planId: $planId, name: $name, date: $date ) {
     id
     name
     date
   }
 }
}`);

export const UPDATE_BUCKET = gql(`
mutation updateBucket($planId: ID!, $bucketId: ID!, $name: String, $date: Date) {
  planner {
    updateBucket(planId: $planId, bucketId: $bucketId, name: $name, date: $date) {
      id
      name
      date
    }
  }
}`);

export const DELETE_BUCKET = gql(`
mutation deleteBucket($planId: ID!, $bucketId: ID!) {
  planner {
    deleteBucket(planId: $planId, bucketId: $bucketId) { id }
  }
}`);

export const DELETE_BUCKETS = gql(`
mutation deleteBuckets($planId: ID!, $bucketIds: [ID!]!) {
  planner {
    deleteBuckets(planId: $planId, bucketIds: $bucketIds) { id }
  }
}`);

export const SET_PLAN_ITEM_STATUS = gql(`
mutation setPlanItemStatus($id: ID!, $status: PlanItemStatus!, $doneAt: DateTime = null) {
  planner {
    setStatus(id: $id, status: $status, doneAt: $doneAt) {
      ...corePlanItemLoad
      ...planItemLoad
    }
  }
}`);

export const SET_PLAN_GRANT = gql(`
mutation setPlanGrant($planId: ID!, $userId: ID!, $accessLevel: AccessLevel!) {
  planner {
    setGrant(planId: $planId, userId: $userId, accessLevel: $accessLevel) {
      id
    }
  }
}`);

export const REVOKE_PLAN_GRANT = gql(`
mutation revokePlanGrant($planId: ID!, $userId: ID!) {
  planner {
    revokeGrant(planId: $planId, userId: $userId) {
      id
    }
  }
}`);
