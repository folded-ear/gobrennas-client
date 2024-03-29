import React, { useMemo } from "react";
import PropTypes from "prop-types";
import TimeLeft from "./TimeLeft";
import { Badge as TopRightBadge, Tab } from "@mui/material";
import { withStyles } from "@mui/styles";
import { Pause, Timer } from "@mui/icons-material";
import { useTimerList } from "../data/TimerContext";

const BottomRightBadge = withStyles({
    badge: {
        top: 24,
    },
})(TopRightBadge);

function NavTab({ defaultLabel, onClick }) {
    const { data: timers } = useTimerList();
    const next = useMemo(() => {
        if (!timers || timers.length === 0) return null;
        const now = Date.now();
        const hotTimers = timers
            .map((it) => ({
                ...it,
                remaining: it.paused ? it.remaining : (it.endAt - now) / 1000,
            }))
            .filter((it) => it.remaining >= 0);
        if (hotTimers.length === 0) return null;
        return hotTimers.reduce(
            (
                n,
                t, // minBy(Timer::remaining)
            ) => (n.remaining < t.remaining ? n : t),
        );
    }, [timers]);

    let icon = <Timer />;
    if (timers.length > 1) {
        icon = (
            <TopRightBadge overlap={"rectangular"} badgeContent={timers.length}>
                {icon}
            </TopRightBadge>
        );
    }
    if (timers.some((it) => it.paused)) {
        icon = (
            <BottomRightBadge
                overlap={"rectangular"}
                badgeContent={<Pause fontSize={"inherit"} />}
            >
                {icon}
            </BottomRightBadge>
        );
    }

    return (
        <Tab
            className={timers.length === 0 ? null : "Mui-selected"}
            icon={icon}
            label={next ? <TimeLeft timer={next} /> : defaultLabel}
            onClick={onClick}
        />
    );
}

NavTab.propTypes = {
    defaultLabel: PropTypes.string,
    onClick: PropTypes.func,
};

export default NavTab;
