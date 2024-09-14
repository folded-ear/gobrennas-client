import { gql } from "@apollo/client";

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

export const RECIPE_CARD_FRAGMENT = gql(`
    fragment recipeCard on Recipe {
      calories
      externalUrl
      favorite
      id
      labels
      name
      owner {
        id
      }
      photo {
        url
        focus
      }
      totalTime
      yield
    }
`);
