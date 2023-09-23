import PropTypes from "prop-types";
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useRawListOfAllTimers } from "./queries";

const TimerContext = createContext(true);

const POLL_INTERVAL = 15 * 1000;

export function TimerProvider({ children }) {
    const raw = useRawListOfAllTimers(POLL_INTERVAL);
    const query = useMemo(
        () => ({
            ...raw,
            data:
                (raw.data &&
                    raw.data.timer.all.map((it) => ({
                        ...it,
                        endAt: it.endAt && Date.parse(it.endAt),
                    }))) ||
                [],
        }),
        [raw],
    );

    useEffect(() => {
        const now = Date.now();
        const running = query.data.filter((it) => !it.paused && it.endAt > now);
        if (running.length === 0) return;
        const refetchIn = Math.min(...running.map((it) => it.endAt - now));
        if (refetchIn < POLL_INTERVAL) {
            const id = setTimeout(() => query.refetch(), refetchIn);
            return () => clearTimeout(id);
        }
    }, [query]);
    return (
        <TimerContext.Provider value={query}>{children}</TimerContext.Provider>
    );
}

TimerProvider.propTypes = {
    children: PropTypes.node,
};

export const useTimerList = () => useContext(TimerContext);
