import {
    ApolloClient as ApolloClientInstance,
    ApolloProvider,
    from,
    HttpLink,
    InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { relayStylePagination } from "@apollo/client/utilities";
import * as React from "react";
import { PropsWithChildren } from "react";
import { API_BASE_URL } from "../constants";
import {
    askUserToReauth,
    isAuthError,
} from "./Profile";

const httpLink = new HttpLink({
    uri: `${API_BASE_URL}/graphql`,
    credentials: "include",
});

const errorLink = onError(({ graphQLErrors }) => {
    if (!graphQLErrors) return;
    graphQLErrors.forEach((error) => {
        // eslint-disable-next-line no-console
        console.error("Error in GraphQL", error);
        if (isAuthError(error)) {
            askUserToReauth();
        }
    });
});

const client = new ApolloClientInstance({
    cache: new InMemoryCache({
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
                    recipes: relayStylePagination([ "scope", "query" ]),
                },
            },
        },
    }),
    link: from([ errorLink, httpLink ]),
});

export function ApolloClient({ children }: PropsWithChildren) {
    return <ApolloProvider client={client}>
        {children}
    </ApolloProvider>;
}
