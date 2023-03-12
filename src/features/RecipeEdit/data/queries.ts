import { gql } from "@apollo/client";

export const listAllLabelsQuery = gql(`
  query listAllLabels {
    labels {
        all {
          name
        }
    }
  }
`);