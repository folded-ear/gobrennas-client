import { gql } from "@/__generated__";

export const CREATE_PLAN_ITEM = gql(`
mutation createPlanItem($parentId: ID!, $afterId: ID, $name: String!) {
  planner {
    createItem(parentId: $parentId, afterId: $afterId, name: $name) {
      ...corePlanItemLoad
      ...planItemLoad
      fullParent: parent {
        ...corePlanItemLoad
        ...planLoad
        ...planItemLoad
      }
    }
  }
}`);

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

export const UPDATE_PLAN_NOTES = gql(`
mutation updatePlanNotes($id:ID!, $notes: String) {
  planner {
    updatePlanNotes(planId: $id, notes: $notes) {
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

export const DELETE_PLAN = gql(`
mutation deletePlan($id: ID!) {
  planner {
    deletePlan(id: $id) { id }
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

export const SPLICE_BUCKETS = gql(`
mutation spliceBuckets($planId: ID!, $idsToDelete: [ID!]!, $toCreate: [UnsavedBucket!]!) {
  planner {
    deleteBuckets(planId: $planId, bucketIds: $idsToDelete) {
      id
    }
    createBuckets(planId: $planId, buckets: $toCreate) {
      id
      name
      date
    }
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

export const ASSIGN_BUCKET = gql(`
mutation assignBucket($id: ID!, $bucketId: ID) {
  planner {
    assignBucket(id: $id, bucketId: $bucketId) {
      id
      name
      status
      bucket {
        id
        name
        date
      }
    }
  }
}`);

export const MUTATE_PLAN_TREE = gql(`
mutation mutatePlanTree($spec: MutatePlanTree!) {
  planner {
    mutateTree(spec: $spec) {
      id
      name
      children {
        id
        name
      }
    }
  }
}`);

export const REORDER_PLAN_ITEMS = gql(`
mutation reorderPlanItems($parentId: ID!, $itemIds: [ID!]!) {
  planner {
    reorderSubitems(parentId: $parentId, itemIds: $itemIds) {
      id
      name
      children {
        id
        name
      }
    }
  }
}`);
