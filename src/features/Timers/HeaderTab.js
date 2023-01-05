import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import PropTypes from "prop-types";
import {
    gql,
    useMutation,
    useQuery,
} from "@apollo/client";
import TimerDrawer from "./components/TimerDrawer";
import TimerAlert from "./components/TimerAlert";
import NavTab from "./components/NavTab";

const LIST_TIMERS = gql`
    query listAllTimers {
        timer {
            all {
                id
                initialDuration
                duration
                remaining
                paused
            }
        }
    }
`;

const PAUSE_TIMER = gql`
    mutation pauseTimer($id: ID!) {
        timer {
            pause(id: $id){
                id
                initialDuration
                duration
                remaining
                paused
            }
        }
    }
`;

const RESUME_TIMER = gql`
    mutation pauseTimer($id: ID!) {
        timer {
            resume(id: $id){
                id
                initialDuration
                duration
                remaining
                paused
            }
        }
    }
`;

const ADD_TIME = gql`
    mutation addTimeToTimer($id: ID!, $duration: NonNegativeInt!) {
        timer {
            addTime(id: $id, duration: $duration) {
                id
                initialDuration
                duration
                remaining
                paused
            }
        }
    }
`;

const DELETE_TIMER = gql`
    mutation deleteTimer($id: ID!) {
        timer {
            delete(id: $id)
        }
    }
`;

const POLL_INTERVAL = 15 * 1000;

function useTimerList() {
    const raw = useQuery(
        LIST_TIMERS,
        {
            pollInterval: POLL_INTERVAL,
            // respond fast, but always keep current
            fetchPolicy: "cache-and-network",
        },
    );
    const query = useMemo(() => ({
        ...raw,
        data: (raw.data && raw.data.timer.all) || [],
    }), [ raw ]);

    useEffect(() => {
        const running = query.data.filter(t => !t.paused && t.remaining > 0);
        if (running.length === 0) return;
        const refetchIn = Math.min(...running.map(it => it.remaining)) * 1000;
        if (refetchIn < POLL_INTERVAL) {
            const id = setTimeout(() => query.refetch(), refetchIn);
            return () => clearTimeout(id);
        }
    }, [ query ]);

    return query;
}

function HeaderTab({ label: defaultLabel }) {
    const { data: timers, refetch } = useTimerList();
    const [ deleteTimer ] = useMutation(DELETE_TIMER);
    const [ pauseTimer ] = useMutation(PAUSE_TIMER);
    const [ resumeTimer ] = useMutation(RESUME_TIMER);
    const [ addTimeToTimer ] = useMutation(ADD_TIME);
    const [ drawerOpen, setDrawerOpen ] = useState(false);

    function handleCreate(duration) {
        alert("can't create. yet.");
    }

    function handleAddTime(id, duration) {
        addTimeToTimer({
            variables: {
                id,
                duration,
            },
        });
    }

    function handlePause(id) {
        pauseTimer({
            variables: {
                id,
            },
        });
    }

    function handleResume(id) {
        resumeTimer({
            variables: {
                id,
            },
        });
    }

    function handleDelete(id) {
        deleteTimer({ // todo: shouldn't need the refresh to resync?
            variables: {
                id,
            },
        }).then(() => refetch());
    }

    function handleRestTo(id, duration) {
        // todo: combine these into a single query
        handleDelete(id);
        handleCreate(duration);
    }

    return <>
        <NavTab
            timers={timers}
            defaultLabel={defaultLabel}
            onClick={() => setDrawerOpen(true)}
        />
        <TimerDrawer
            timers={timers}
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onCreate={handleCreate}
            onAddTime={handleAddTime}
            onPause={handlePause}
            onResume={handleResume}
            onDelete={handleDelete}
        />
        <TimerAlert
            timers={timers}
            onAddTime={handleRestTo}
            onStop={handleDelete}
        />
    </>;
}

HeaderTab.propTypes = {
    label: PropTypes.string,
};

export default HeaderTab;
