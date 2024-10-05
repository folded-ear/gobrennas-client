import { gql } from "@/__generated__";

export const RENAME_PLAN_ITEM = gql(`
mutation renamePlanItem($id: ID!, $name: String!) {
  planner {
    rename(id: $id, name: $name) {
      id
      name
      preparation
      ingredient {
        id
      }
      quantity {
        quantity
        units {
          name
          id
        }
      }
      status
      notes
      parent {
        id
      }
      aggregate {
        id
      }
      children {
        id
      }
      components {
        id
      }
      bucket {
        id
      }
    }
  }
}
`);

export const SET_PLAN_COLOR = gql(`
mutation setPlanColor($id: ID!, $color: String!) {
  planner {
    setColor(planId: $id, color: $color) {
      id
      name
      color
    }
  }
}`);

export const DELETE_PLAN_ITEM = gql(`
mutation deletePlanItem($id: ID!) {
  planner {
    deleteItem(id: $id) {
      id
    }
  }
}
`);

export const CREATE_PLAN = gql(`
mutation createPlan($name: String!, $sourcePlanId: ID) {
  planner {
    createPlan(name: $name, sourcePlanId: $sourcePlanId) {
      id
      name
      owner {
        id
      }
    }
  }
}
`);

export const CREATE_BUCKET = gql(`
mutation createBucket($planId: ID!, $name: String, $date: Date ) {
  planner {
    createBucket(planId: $planId, name: $name, date: $date ) {
     id
     name
     date
   }
 }
}
`);

export const UPDATE_BUCKET = gql(`
mutation updateBucket($planId: ID!, $bucketId: ID!, $name: String, $date: Date) {
  planner {
    updateBucket(planId: $planId, bucketId: $bucketId, name: $name, date: $date) {
      id
      name
      date
    }
  }
}
`);

export const DELETE_BUCKET = gql(`
mutation deleteBucket($planId: ID!, $bucketId: ID!) {
  planner {
    deleteBucket(planId: $planId, bucketId: $bucketId) {
      id
    }
  }
}
`);

export const DELETE_BUCKETS = gql(`
mutation deleteBuckets($planId: ID!, $bucketIds: [ID!]!) {
  planner {
    deleteBuckets(planId: $planId, bucketIds: $bucketIds) {
      id
    }
  }
}
`);

export const COMPLETE_PLAN_ITEM = gql(`
mutation setStatus($id: ID!, $status: PlanItemStatus!, $doneAt: DateTime) {
  planner {
    setStatus(id: $id, status: $status, doneAt: $doneAt) {
      id
    }
  }
}
`);
