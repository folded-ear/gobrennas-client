import React from "react";
import { useQuery } from "react-query";

const useSynchronizer = (queryKey, queryFn, options = {}) => {
    const [ ts, setTs ] = React.useState(Date.now());
    const refetchInterval = React.useMemo(
        () => (15 + (Math.random() - 0.5) * 5) * 1000,
        [],
    );
    useQuery(
        queryKey,
        () => queryFn(ts).then(data => {
            setTs(Date.now());
            return data;
        }),
        {
            refetchInterval,
            refetchIntervalInBackground: false,
            ...options,
        },
    );
};

export default useSynchronizer;
