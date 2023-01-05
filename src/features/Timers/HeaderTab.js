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
                endAt
                remaining
                paused
            }
        }
    }
`;

const CREATE_TIMER = gql`
    mutation createTimer($duration: PositiveInt!){
        timer {
            create(duration: $duration) {
                id
                initialDuration
                endAt
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
                endAt
                remaining
                paused
            }
        }
    }
`;

const RESUME_TIMER = gql`
    mutation resumeTimer($id: ID!) {
        timer {
            resume(id: $id){
                id
                endAt
                remaining
                paused
            }
        }
    }
`;

const ADD_TIME = gql`
    mutation addTimeToTimer($id: ID!, $duration: PositiveInt!) {
        timer {
            addTime(id: $id, duration: $duration) {
                id
                endAt
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

const RESET_TIMER = gql`
    mutation resetTimer($id: ID!, $duration: PositiveInt!) {
        timer {
            delete(id: $id)
            create(duration: $duration) { id }
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
        data: (raw.data && raw.data.timer.all.map(it => ({
            ...it,
            endAt: it.endAt && Date.parse(it.endAt),
        }))) || [],
    }), [ raw ]);

    useEffect(() => {
        const now = Date.now();
        const running = query.data.filter(it =>
            !it.paused && it.endAt > now);
        if (running.length === 0) return;
        const refetchIn = Math.min(...running.map(it =>
            it.endAt - now));
        if (refetchIn < POLL_INTERVAL) {
            const id = setTimeout(() => query.refetch(), refetchIn);
            return () => clearTimeout(id);
        }
    }, [ query ]);

    return query;
}

function HeaderTab({ label: defaultLabel }) {
    const { data: timers } = useTimerList();
    const [ createTimer ] = useMutation(CREATE_TIMER);
    const [ deleteTimer ] = useMutation(DELETE_TIMER);
    const [ pauseTimer ] = useMutation(PAUSE_TIMER);
    const [ resumeTimer ] = useMutation(RESUME_TIMER);
    const [ addTimeToTimer ] = useMutation(ADD_TIME);
    const [ resetTimer ] = useMutation(RESET_TIMER);
    const [ drawerOpen, setDrawerOpen ] = useState(false);

    function handleCreate(duration) {
        createTimer({
            variables: {
                duration,
            },
            refetchQueries: [ "listAllTimers" ],
        });
    }

    function handleAddTime(timer, duration) {
        addTimeToTimer({
            variables: {
                id: timer.id,
                duration,
            },
        });
    }

    function handlePause(timer) {
        pauseTimer({
            variables: {
                id: timer.id,
            },
        });
    }

    function handleResume(timer) {
        resumeTimer({
            variables: {
                id: timer.id,
            },
        });
    }

    function handleDelete(timer) {
        deleteTimer({
            variables: {
                id: timer.id,
            },
            refetchQueries: [ "listAllTimers" ],
        });
    }

    function handleReset(timer) {
        handleResetTo(timer, timer.initialDuration);
    }

    function handleResetTo(timer, duration) {
        resetTimer({
            variables: {
                id: timer.id,
                duration,
            },
            refetchQueries: [ "listAllTimers" ],
        });
    }

    return <>
        <NavTab
            timers={drawerOpen ? [] : timers}
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
            onReset={handleReset}
            onAddTime={handleResetTo}
            onStop={handleDelete}
        />
    </>;
}

HeaderTab.propTypes = {
    label: PropTypes.string,
};

export default HeaderTab;
