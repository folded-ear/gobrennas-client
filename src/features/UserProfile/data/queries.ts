import { gql } from "../../../__generated__";

export const GetCurrentUserQuery = gql(`
    query GetCurrentUser {
        getCurrentUser {
            id
            name
            email
            imageUrl
            provider
        }
    }
`);
