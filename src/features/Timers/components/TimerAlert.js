import React, {
    useEffect,
    useState,
} from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
} from "@material-ui/core";
import AddTimeButton from "./AddTimeButton";
import {
    Replay as ResetIcon,
    Stop as StopIcon,
} from "@material-ui/icons";
import { formatTimer } from "../../../util/time";
import TimeLeft from "./TimeLeft";
import { arrayOfTimersType } from "../types/types";
import alarm from "../media/alarm.mp3";

function TimerAlert({
                        timers,
                        onAddTime,
                        onReset,
                        onStop,
                    }) {
    const [ completed, setCompleted ] = useState(undefined);

    useEffect(() => {
        setCompleted(timers.filter(it => it.remaining <= 0)
            .sort((a, b) => a.remaining - b.remaining)[0]);
    }, [ timers ]);

    if (!completed) {
        return null;
    }

    return <Dialog
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
            <AddTimeButton
                seconds={60}
                onClick={sec => onAddTime(completed, sec)}
            />
            <IconButton
                onClick={() => onReset(completed)}
            >
                <ResetIcon />
            </IconButton>
            <IconButton
                onClick={() => onStop(completed)}
            >
                <StopIcon />
            </IconButton>
        </DialogActions>
    </Dialog>;
}

TimerAlert.propTypes = {
    timers: arrayOfTimersType,
    onAddTime: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
};

export default TimerAlert;
