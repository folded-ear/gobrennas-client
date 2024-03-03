import { useIsAuthenticated } from "providers/Profile";
import React from "react";
import { useQueries } from "react-query";
import { UseQueryOptions } from "react-query/types/react/types";

interface ToSync
    extends Omit<
        UseQueryOptions<any, any, any, unknown[]>,
        "queryKey" | "queryFn"
    > {
    queryKey: unknown[];
    queryFn: (ts: number) => Promise<unknown>;
}

function useSynchronizer(
    queryKey: ToSync["queryKey"],
    queryFn: ToSync["queryFn"],
    options: Omit<ToSync, "queryKey" | "queryFn"> = {},
) {
    useSynchronizers([{ queryKey, queryFn, ...options }]);
}

export function useSynchronizers(queries: ToSync[]) {
    const [ts, setTs] = React.useState(Date.now());
    const authenticated = useIsAuthenticated();
    useQueries(
        queries.map(({ queryKey, queryFn, ...options }) => {
            return {
                queryKey: [...queryKey, authenticated],
                queryFn: () => {
                    const nextTs = Date.now();

                    return (
                        authenticated ? queryFn(ts) : Promise.reject()
                    ).finally(() => setTs(nextTs));
                },
                refetchInterval: (15 + (Math.random() - 0.5) * 5) * 1000,
                refetchIntervalInBackground: false,
                ...options,
            };
        }),
    );
}

export default useSynchronizer;
