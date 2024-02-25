import {
    gql as listAllLabelsQuery,
    gql as fullRecipeQuery,
} from "__generated__";

export const GET_FULL_RECIPE_QUERY = fullRecipeQuery(`
query getRecipeWithEverything($id: ID!) {
  library {
    getRecipeById(id: $id) {
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

export const LIST_ALL_LABELS_QUERY = listAllLabelsQuery(`
  query listAllLabels {
    labels {
        all {
          name
        }
    }
  }
`);
