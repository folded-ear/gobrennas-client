import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
} from "@mui/material";
import AddTimeButton from "./AddTimeButton";
import { ResetIcon, StopIcon } from "views/common/icons";
import { formatTimer } from "../../../util/time";
import TimeLeft from "./TimeLeft";
import alarm from "../media/alarm.mp3";
import { useTimerList } from "../data/TimerContext";
import { useDeleteTimer, useResetTimer } from "../data/queries";

function TimerAlert() {
    const { data: timers } = useTimerList();
    const [completed, setCompleted] = useState(undefined);
    const [doReset] = useResetTimer();
    const [doDelete] = useDeleteTimer();

    useEffect(() => {
        setCompleted(
            timers
                .filter((it) => it.remaining <= 0)
                .sort((a, b) => a.remaining - b.remaining)[0],
        );
    }, [timers]);

    if (!completed) {
        return null;
    }

    const handleAddTime = (duration) => doReset(completed.id, duration);
    const handleReset = () => doReset(completed.id, completed.initialDuration);
    const handleStop = () => doDelete(completed.id);

    return (
        <Dialog
            open={true}
            aria-labelledby="timer-alert-title"
            aria-describedby="timer-alert-description"
        >
            <DialogTitle id="timer-alert-title">
                {formatTimer(completed.initialDuration)} Timer Complete!
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    And it's been <TimeLeft timer={completed} /> since.
                </DialogContentText>
                <audio src={alarm} autoPlay loop />
            </DialogContent>
            <DialogActions>
                <AddTimeButton seconds={60} onClick={handleAddTime} />
                <IconButton onClick={handleReset} size="large">
                    <ResetIcon />
                </IconButton>
                <IconButton onClick={handleStop} size="large">
                    <StopIcon />
                </IconButton>
            </DialogActions>
        </Dialog>
    );
}

export default TimerAlert;
