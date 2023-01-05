import React, { useMemo } from "react";
import PropTypes from "prop-types";
import Countdown from "./Countdown";
import {
    Badge as TopRightBadge,
    Tab,
    withStyles,
} from "@material-ui/core";
import {
    Pause,
    Timer,
} from "@material-ui/icons";
import { arrayOfTimersType } from "../types/types";

const BottomRightBadge = withStyles({
    badge: {
        top: 24,
    },
})(TopRightBadge);

function NavTab({
                    timers,
                    defaultLabel,
                    onClick,
                }) {
    const next = useMemo(() => {
        if (!timers || timers.length === 0) return null;
        const start = Date.now();
        const elapsed = Math.ceil((Date.now() - start) / 1000);
        const hotTimers = timers
            .map(it => ({
                    ...it,
                    remaining: it.paused
                        ? it.remaining
                        : it.remaining - elapsed,
                }),
            )
            .filter(it => it.remaining >= 0);
        if (hotTimers.length === 0) return null;
        return hotTimers.reduce((n, t) =>
            n.remaining < t.remaining ? n : t);
    }, [ timers ]);

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
        label={next
            ? <Countdown {...next} />
            : defaultLabel}
        onClick={onClick}
    />;
}

NavTab.propTypes = {
    timers: arrayOfTimersType,
    defaultLabel: PropTypes.string,
    onClick: PropTypes.func,
};

export default NavTab;
