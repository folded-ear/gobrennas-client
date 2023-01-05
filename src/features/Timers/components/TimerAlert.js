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
import { Stop as StopIcon } from "@material-ui/icons";
import { formatTimer } from "../../../util/time";
import TimeSince from "./TimeSince";
import { arrayOfTimersType } from "../types/types";

function TimerAlert({
                        timers,
                        onAddTime,
                        onStop,
                    }) {
    const [ completed, setCompleted ] = useState([]);

    useEffect(() => {
        setCompleted(timers.filter(t => t.remaining <= 0)
            .sort((a, b) => a.remaining - b.remaining));
    }, [ timers ]);

    if (completed.length === 0) {
        return null;
    }
    const it = completed[0];

    return <Dialog
        open={true}
        aria-labelledby="timer-alert-title"
        aria-describedby="timer-alert-description"
    >
        {/* todo: make this play noise! */}
        <DialogTitle id="timer-alert-title">
            {formatTimer(it.initialDuration)} Timer Complete!
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <TimeSince
                    when={Date.now() + it.remaining * 1000}
                /> ago, actually.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <AddTimeButton
                seconds={60}
                onClick={sec => onAddTime(it.id, sec)}
            />
            <IconButton
                onClick={() => onStop(it.id)}
            >
                <StopIcon />
            </IconButton>
        </DialogActions>
    </Dialog>;
}

TimerAlert.propTypes = {
    timers: arrayOfTimersType,
    onAddTime: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
};

export default TimerAlert;
