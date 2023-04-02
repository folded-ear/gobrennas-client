import { useIsAuthenticated } from "providers/Profile";
import React from "react";
import { useQuery } from "react-query";

const useSynchronizer = (queryKey: unknown[],
                         queryFn: (ts: number) => Promise<unknown>,
                         options = {}) => {
    const [ ts, setTs ] = React.useState(Date.now());
    const refetchInterval = React.useMemo(
        () => (15 + (Math.random() - 0.5) * 5) * 1000,
        [],
    );
    const authenticated = useIsAuthenticated();
    useQuery(
        [ ...queryKey, authenticated ],
        () => {
            const nextTs = Date.now();

            return (authenticated ? queryFn(ts) : Promise.reject())
                .finally(() => setTs(nextTs));
        },
        {
            refetchInterval,
            refetchIntervalInBackground: false,
            ...options,
        },
    );
};

export default useSynchronizer;
