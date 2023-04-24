import { gql } from "../../../__generated__";

export const getFullRecipeQuery = gql(`
  query getRecipeWithEverything($id: ID!) {
    recipe: node(id: $id) {
      ... on Recipe {
        ...recipeCore
        favorite
        yield
        calories
        externalUrl
        labels
        photo {
          url
          focus
        }
        owner {
          id
          name
          email
          imageUrl
        }
        subrecipes {
          ...recipeCore
        }
      }
    }
  }

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
  }`);
