import { gql } from "@/__generated__";

export const ORDER_FOR_STORE = gql(`
mutation orderForStore($id: ID!, $targetId: ID!, $after: Boolean = true){
  pantry {
    orderForStore(id: $id, targetId: $targetId, after: $after) {
      id
      name
      storeOrder
    }
  }
}`);
