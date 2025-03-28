import { API_BASE_URL } from "@/constants";
import {
    CORE_PLAN_ITEM_LOAD_FRAGMENT,
    INGREDIENT_LOAD_FRAGMENT,
    PANTRY_ITEM_LOAD_FRAGMENT,
    PLAN_ITEM_LOAD_FRAGMENT,
    PLAN_LOAD_FRAGMENT,
} from "@/data/hooks/fragments";
import {
    ApolloClient,
    ApolloLink,
    defaultDataIdFromObject,
    HttpLink,
    InMemoryCache,
} from "@apollo/client";
import { createFragmentRegistry } from "@apollo/client/cache";
import { onError } from "@apollo/client/link/error";
import { relayStylePagination } from "@apollo/client/utilities";
import possibleTypes from "./apolloPossibleTypes";
import { askUserToReauth, isAuthError } from "./Profile";

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

// graphql-codegen parses our GraphQL queries statically at compile time; this
// provides a suggestively named escape hatch for runtime-dynamic queries.
//
// eslint-disable-next-line no-restricted-imports
export { gql as compileDynamicGraphQLQuery } from "@apollo/client";

export const client = new ApolloClient({
    cache: new InMemoryCache({
        possibleTypes,
        // This allows the dynamic queries to reference these fragments, and let
        // Apollo add them before sending the query to the server. Most of our
        // GraphQL queries are static, so that voodoo happens via codegen, but
        // dynamically constructed queries can't leverage that.
        fragments: createFragmentRegistry(
            INGREDIENT_LOAD_FRAGMENT,
            PANTRY_ITEM_LOAD_FRAGMENT,
            CORE_PLAN_ITEM_LOAD_FRAGMENT,
            PLAN_ITEM_LOAD_FRAGMENT,
            PLAN_LOAD_FRAGMENT,
        ),
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
        new HttpLink({
            uri: `${API_BASE_URL}/graphql`,
            credentials: "include",
        }),
    ]),
});
