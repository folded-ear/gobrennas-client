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
