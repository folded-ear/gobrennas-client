import { ApolloQueryResult, OperationVariables, QueryResult, TypedDocumentNode, useQuery } from "@apollo/client";
import { useCallback, useMemo } from "react";
import type { NoInfer, QueryHookOptions } from "@apollo/client/react/types/types";

/**
 * I apply an adapter to both query and refetched data, properly memoized. In
 * theory, I return a `QueryResult<TAdaptedData, TVariables>`, but Apollo's
 * types don't quite like that work without a bunch of pointless shenanigans, so
 * I opted to kick that can down the road a ways.
 *
 * @param query The GQL query to pass to useQuery.
 * @param resultAdapter An adapter from the query result to the desired type.
 * @param options The query options to pass to useQuery.
 */
export default function useAdaptingQuery<
    TData,
    TVariables extends OperationVariables,
    TAdaptedData,
>(
    query: TypedDocumentNode<TData, TVariables>,
    resultAdapter: (
        data: TData | undefined,
        result: QueryResult<TData, TVariables> | ApolloQueryResult<TData>,
    ) => TAdaptedData,
    options: QueryHookOptions<NoInfer<TData>, NoInfer<TVariables>>,
) {
    const raw = useQuery(query, options);

    const data = useMemo(() => {
        return resultAdapter(raw.data, raw);
    }, [resultAdapter, raw]);

    const refetch = useCallback(
        (variables: Partial<TVariables> | undefined) =>
            raw.refetch(variables).then((refetched) => ({
                ...refetched,
                data: resultAdapter(refetched.data, refetched),
            })),
        [resultAdapter, raw],
    );

    return {
        ...raw,
        data,
        refetch,
    };
}
