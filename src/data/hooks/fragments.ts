// noinspection JSUnusedGlobalSymbols
// Required for typed codegen, not imported directly into queries

import { gql } from "@/__generated__";

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
      units { name }
    }
    ingredient {
      id
      name
    }
    preparation
  }
}`);

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
}`);

export const CORE_PLAN_ITEM_LOAD_FRAGMENT = gql(`
fragment corePlanItemLoad on CorePlanItem {
  id
  name
  children { id }
}`);

export const PLAN_LOAD_FRAGMENT = gql(`
fragment planLoad on Plan {
  color
  owner { id }
  grants {
    user { id }
    level
  }
  buckets {
    id
    date
    name
  }
}`);

export const PLAN_ITEM_LOAD_FRAGMENT = gql(`
fragment planItemLoad on PlanItem {
  status
  notes
  parent { id }
  aggregate { id }
  preparation
  ingredient { id }
  quantity {
    quantity
    units {
      name
      id
    }
  }
  components { id }
  bucket { id }
}`);
