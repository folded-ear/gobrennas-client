import { gql } from "@/__generated__";

// Required for typed codegen, not imported directly into queries
// noinspection JSUnusedLocalSymbols
export const RECIPE_CORE_FRAGMENT = gql(`
    fragment recipeCore on Recipe {
        id
        name
        directions
        totalTime
        ingredients {
            raw
            quantity {
                quantity
                units {
                    name
                }
            }
            ingredient {
                __typename
                id
                name
            }
            preparation
        }
    }
`);

export const LIBRARY_SEARCH_RESULT_FRAGMENT = gql(`
fragment librarySearchResult on RecipeConnection {
  edges {
    cursor
    node {
      id
      owner {
        id
        imageUrl
        email
        name
      }
      photo {
        url
        focus
      }
      name
      favorite
      labels
      externalUrl
      calories
      yield
      totalTime
    }
  }
  pageInfo {
    hasNextPage
    endCursor
  }
}
`);
