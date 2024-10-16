import {
    ApolloClient,
    ApolloLink,
    defaultDataIdFromObject,
    InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { relayStylePagination } from "@apollo/client/utilities";
import { API_BASE_URL } from "@/constants";
import { askUserToReauth, isAuthError } from "./Profile";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import possibleTypes from "./apolloPossibleTypes";

const errorLink = onError(({ operation, graphQLErrors }) => {
    // don't ask about reauth if requesting me; that's the profile gate
    if (!graphQLErrors || operation.operationName === "me") return;
    graphQLErrors.forEach((error) => {
        // eslint-disable-next-line no-console
        console.error("Error in GraphQL", error);
        if (isAuthError(error)) {
            askUserToReauth();
        }
    });
});

export const client = new ApolloClient({
    cache: new InMemoryCache({
        possibleTypes,
        typePolicies: {
            Query: {
                fields: {
                    library: {
                        merge(existing, incoming, { mergeObjects }) {
                            return mergeObjects(existing, incoming);
                        },
                    },
                },
            },
            LibraryQuery: {
                fields: {
                    recipes: relayStylePagination(["scope", "query"]),
                    suggestRecipesToCook: relayStylePagination(false),
                },
            },
        },
        dataIdFromObject(responseObject) {
            switch (responseObject.__typename) {
                // use keys based on the root of inheritance hierarchies
                case "Plan":
                    return `PlanItem:${responseObject.id}`;
                case "PantryItem":
                case "Recipe":
                    return `Ingredient:${responseObject.id}`;
                default:
                    return defaultDataIdFromObject(responseObject);
            }
        },
    }),
    link: ApolloLink.from([
        errorLink,
        createUploadLink({
            uri: `${API_BASE_URL}/graphql`,
            credentials: "include",
            headers: {
                "Apollo-Require-Preflight": "true",
            },
        }),
    ]),
});
