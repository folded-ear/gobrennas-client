import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { formatTimer } from "../../../util/time";
import { timerType } from "../types/types";
import { Box, LinearProgress } from "@mui/material";

const secondsLeft = (end) => (end - Date.now()) / 1000;

function Viz({ duration, remaining, overageIndicator, progress = false }) {
    let body =
        (remaining < 0 ? overageIndicator : "") +
        formatTimer(Math.abs(remaining));
    if (progress && remaining >= 0) {
        body = (
            <Box>
                {body}
                <LinearProgress
                    variant="determinate"
                    value={((duration - remaining) / duration) * 100 + 100}
                />
            </Box>
        );
    }
    return body;
}

function TimeLeft({
    timer: { endAt, duration, remaining, paused },
    overageIndicator = "",
    progress = false,
}) {
    const [sec, setSec] = useState(paused ? remaining : secondsLeft(endAt));
    useEffect(() => {
        if (paused) return;
        // Instead of using an interval, schedule for the top of the next
        // second. That way if multiple timers are visible, they will move
        // forward in sync (or, at least, very close to it).
        let id;
        (function loop() {
            const delay = 1000 - (Date.now() % 1000);
            id = setTimeout(() => {
                setSec(secondsLeft(endAt));
                loop();
            }, delay);
        })();
        return () => clearTimeout(id);
    }, [paused, endAt]);
    return (
        <Viz
            duration={duration}
            remaining={sec}
            progress={progress}
            overageIndicator={overageIndicator}
        />
    );
}

TimeLeft.propTypes = {
    timer: timerType.isRequired,
    overageIndicator: PropTypes.string,
    progress: PropTypes.bool,
};

export default TimeLeft;
