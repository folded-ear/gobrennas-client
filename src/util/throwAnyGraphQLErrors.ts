import { GraphQLFormattedError } from "graphql/index";

export default function throwAnyGraphQLErrors(
    errors: ReadonlyArray<GraphQLFormattedError> | undefined,
) {
    if (errors && errors.length) {
        let msg = "GraphQL error:\n\n" + errors[0];
        if (errors.length === 1) {
            // eslint-disable-next-line no-console
            console.error("GraphQL Error", errors[0]);
        } else {
            // eslint-disable-next-line no-console
            console.error("GraphQL Errors", errors);
            msg += `\n\nPlus ${errors.length - 1} more.`;
        }
        throw new Error(msg);
    }
}
