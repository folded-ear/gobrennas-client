import {
    ApolloClient as ApolloClientInstance,
    ApolloLink,
    ApolloProvider,
    InMemoryCache,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { relayStylePagination } from "@apollo/client/utilities";
import * as React from "react";
import { PropsWithChildren } from "react";
import { API_BASE_URL } from "../constants";
import { askUserToReauth, isAuthError } from "./Profile";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

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
                    recipes: relayStylePagination(["scope", "query"]),
                },
            },
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

export function ApolloClient({ children }: PropsWithChildren) {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
