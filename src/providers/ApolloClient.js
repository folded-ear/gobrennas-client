import {ApolloClient as ApolloClientInstance, ApolloProvider, createHttpLink, InMemoryCache} from "@apollo/client";
import PropTypes from "prop-types";
import * as React from "react";


const link = createHttpLink({
    uri: "http://localhost:8080/graphql",
    credentials: "include",
});

const client = new ApolloClientInstance({
    cache: new InMemoryCache(),
    link
});

export function ApolloClient({children}) {
    return <ApolloProvider  client={client}>{children}</ApolloProvider>;
}

ApolloClient.propTypes = {
    children: PropTypes.node,
};

