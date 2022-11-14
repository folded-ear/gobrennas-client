import React from "react";
import { useQuery } from "react-query";
import { useIsAuthenticated } from "providers/Profile";

const useSynchronizer = (queryKey, queryFn, options = {}) => {
    const [ ts, setTs ] = React.useState(Date.now());
    const refetchInterval = React.useMemo(
        () => (15 + (Math.random() - 0.5) * 5) * 1000,
        [],
    );
    const authorized = useIsAuthenticated();
    useQuery(
        [ ...queryKey, authorized ],
        () => {
            const nextTs = Date.now();

            return (authorized ? queryFn(ts) : Promise.reject())
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
