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
