import React from "react";
import PropTypes from "prop-types";
import {
    Badge as TopRightBadge,
    Tab,
    withStyles,
} from "@material-ui/core";
import {
    Pause,
    Timer,
} from "@material-ui/icons";
import { formatTimer } from "util/time";
import {
    gql,
    useMutation,
    useQuery,
} from "@apollo/client";

const LIST_TIMERS = gql`
    query list {
        timer {
            all {
                id
                duration
                remaining
                paused
            }
        }
    }
`;

const DELETE_TIMER = gql`
    mutation delete($id: ID!) {
        timer {
            delete(id: $id)
        }
    }
`;

const BottomRightBadge = withStyles({
    badge: {
        top: 24,
    },
})(TopRightBadge);

function HeaderTab({ label: defaultLabel }) {
    const [ timers, setTimers ] = React.useState([]);
    const [ label, setLabel ] = React.useState(defaultLabel);
    const notified = React.useMemo(() => new Set(), []);
    const { data, refetch } = useQuery(
        LIST_TIMERS,
        {
            pollInterval: 1000 * 15,
            fetchPolicy: "cache-and-network",
        },
    );
    const [ deleteTimer ] = useMutation(DELETE_TIMER);

    React.useEffect(() => {
        if (!data) return;
        const timers = data.timer.all;
        setTimers(timers);
        if (timers.length === 0) {
            setLabel(defaultLabel);
            return;
        }
        const start = Date.now();
        let timeout;
        const relabel = () => {
            const elapsed = Math.ceil((Date.now() - start) / 1000);
            let hotTimers = timers
                .map(it => ({
                        ...it,
                        remaining: it.paused
                            ? it.remaining
                            : it.remaining - elapsed,
                    }),
                )
                .filter(it => it.remaining >= 0 || !notified.has(it.id));
            if (hotTimers.length === 0) {
                setLabel(defaultLabel);
                return;
            }
            const next = hotTimers.reduce((n, t) =>
                n.remaining < t.remaining ? n : t);
            if (next.remaining < 0) {
                notified.add(next.id);
                alert(`BEEP! BEEP!\n\n${formatTimer(next.duration)} is up!\n\nBEEP! BEEP!`);
                // don't delete it until acknowledged...
                deleteTimer({
                    variables: {
                        id: next.id,
                    },
                }).then(() => {
                    notified.delete(next.id);
                    return refetch();
                });
                return;
            } else {
                if (timeout != null) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                if (next.remaining <= 1) {
                    // noinspection JSIgnoredPromiseFromCall
                    refetch();
                } else {
                    timeout = setTimeout(refetch, (next.remaining - 1) * 1000);
                }
            }
            setLabel(formatTimer(next.remaining));
        };
        relabel();
        let interval;
        if (timers.some(it => !it.paused)) {
            interval = setInterval(relabel, 950);
        }
        return () => {
            if (interval != null) {
                clearInterval(interval);
                interval = null;
            }
            if (timeout != null) {
                clearTimeout(timeout);
                timeout = null;
            }
        };
    }, [ defaultLabel, data, refetch, notified, deleteTimer ]);

    const handleClick = () => {
        alert("oh hai.");
    };

    let icon = <Timer />;
    if (timers.length > 1) {
        icon = <TopRightBadge badgeContent={timers.length}>
            {icon}
        </TopRightBadge>;
    }
    if (timers.some(it => it.paused)) {
        icon = <BottomRightBadge badgeContent={<Pause fontSize={"inherit"} />}>
            {icon}
        </BottomRightBadge>;
    }

    return <Tab
        className={timers.length === 0 ? null : "Mui-selected"}
        icon={icon}
        label={label}
        onClick={handleClick}
    />;
}

HeaderTab.propTypes = {
    label: PropTypes.string,
};

export default HeaderTab;
