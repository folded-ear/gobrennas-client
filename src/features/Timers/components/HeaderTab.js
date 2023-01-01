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

const BottomRightBadge = withStyles({
    badge: {
        top: 24,
    },
})(TopRightBadge);

function HeaderTab({ label: defaultLabel }) {
    const timers = [
        // {
        //     "id": "4693",
        //     "duration": 3600,
        //     "remaining": 2507,
        //     "running": true,
        //     "paused": false,
        //     "complete": false,
        // },
        // {
        //     "id": "4743",
        //     "duration": 3600,
        //     "remaining": 3557,
        //     "running": true,
        //     "paused": false,
        //     "complete": false,
        // },
        { // paused
            "id": "4744",
            "duration": 7016,
            "remaining": 6972,
            "running": false,
            "paused": true,
            "complete": false,
        },
    ];

    const handleClick = () => {
        alert("oh hai.");
    };

    if (timers.length === 0) {
        return <Tab
            icon={<Timer />}
            label={defaultLabel}
            onClick={handleClick}
        />;
    }

    const next = timers.reduce((n, c) =>
        n.remaining < c.remaining ? n : c, timers[0]);

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
        icon={icon}
        label={formatTimer(next.remaining)}
        onClick={handleClick}
    />;
}

HeaderTab.propTypes = {
    label: PropTypes.string,
};

export default HeaderTab;
