import { gql, useMutation, useQuery, } from "@apollo/client";
import { useMemo } from "react";
import { useIsAuthenticated } from "../../../providers/Profile";

const useWrappedMutation = (mutation, options, wrapWork) => {
    const [ work, ...rest ] = useMutation(mutation, options);
    const wrappedWork = useMemo(
        () => wrapWork(work),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ work ],
    );
    return [ wrappedWork, ...rest ];
};

const LIST_TIMERS = gql`
    query listAllTimers {
        timer {
            all {
                id
                initialDuration
                duration
                endAt
                remaining
                paused
            }
        }
    }
`;

/** You don't want this one; you want `TimerContext.js`'s `useTimerList`. */
export const useRawListOfAllTimers = (pollInterval = 15_000) => {
    const authenticated = useIsAuthenticated();
    return useQuery(
        LIST_TIMERS,
        {
            skip: !authenticated,
            pollInterval: pollInterval,
            // respond fast, but always keep current
            fetchPolicy: "cache-and-network",
        },
    );
};

const CREATE_TIMER = gql`
    mutation createTimer($duration: PositiveInt!){
        timer {
            create(duration: $duration) {
                id
                initialDuration
                duration
                endAt
                remaining
                paused
            }
        }
    }
`;

export const useCreateTimer = options =>
    useWrappedMutation(CREATE_TIMER, options, createTimer => duration =>
        createTimer({
            variables: {
                duration,
            },
            refetchQueries: [ "listAllTimers" ],
        }));

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

export const usePauseTimer = options =>
    useWrappedMutation(PAUSE_TIMER, options, pauseTimer => id =>
        pauseTimer({
            variables: {
                id,
            },
        }));

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

export const useResumeTimer = options =>
    useWrappedMutation(RESUME_TIMER, options, resumeTimer => id =>
        resumeTimer({
            variables: {
                id,
            },
        }));

const ADD_TIME = gql`
    mutation addTimeToTimer($id: ID!, $duration: PositiveInt!) {
        timer {
            addTime(id: $id, duration: $duration) {
                id
                duration
                endAt
                remaining
                paused
            }
        }
    }
`;

export const useAddTimeToTimer = options =>
    useWrappedMutation(ADD_TIME, options, addTimeToTimer => (id, duration) =>
        addTimeToTimer({
            variables: {
                id,
                duration,
            },
        }));

const DELETE_TIMER = gql`
    mutation deleteTimer($id: ID!) {
        timer {
            delete(id: $id)
        }
    }
`;

export const useDeleteTimer = options =>
    useWrappedMutation(DELETE_TIMER, options, deleteTimer => id =>
        deleteTimer({
            variables: {
                id,
            },
            refetchQueries: [ "listAllTimers" ],
        }));

const RESET_TIMER = gql`
    mutation resetTimer($id: ID!, $duration: PositiveInt!) {
        timer {
            delete(id: $id)
            create(duration: $duration) { id }
        }
    }
`;

export const useResetTimer = options =>
    useWrappedMutation(RESET_TIMER, options, resetTimer => (id, duration) =>
        resetTimer({
            variables: {
                id,
                duration,
            },
            refetchQueries: [ "listAllTimers" ],
        }));
