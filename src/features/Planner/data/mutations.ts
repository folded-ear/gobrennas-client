import { gql } from "__generated__";

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

export const DELETE_PLAN_ITEM = gql(`
mutation deletePlanItem($id: ID!) {
  planner {
    deleteItem(id: $id) {
      id
    }
  }
}
`);
