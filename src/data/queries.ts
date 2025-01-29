import { gql } from "@/__generated__";

export const GET_RECIPE_SHARE_INFO = gql(`
query getRecipeShareInfo($id: ID!) {
  library {
    getRecipeById(id: $id) {
      share {
        id
        slug
        secret
      }
    }
  }
}`);

export const GET_RECOGNIZED_ITEM = gql(`
query recognizeItem($raw: String!, $cursor: NonNegativeInt) {
  library {
    recognizeItem(raw: $raw, cursor: $cursor) {
      raw
      cursor
      ranges {
        ...recogRange
        quantity
      }
      suggestions {
        name
        target {
          ...recogRange
        }
      }
    }
  }
}`);
