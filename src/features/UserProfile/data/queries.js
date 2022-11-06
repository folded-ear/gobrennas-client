import {gql} from "@apollo/client";

export const GetCurrentUserQuery = gql`
    query GetCurrentUser {
        getCurrentUser {
            id
            name
            email
            imageUrl
            provider
        }
    }
`;