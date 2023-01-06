import React, { useState } from "react";
import PropTypes from "prop-types";
import {
    Box,
    Drawer,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    TextField,
} from "@material-ui/core";
import {
    Delete as DeleteIcon,
    Pause as PauseIcon,
    PlayArrow as PlayIcon,
} from "@material-ui/icons";
import TimeLeft from "./TimeLeft";
import AddTimeButton from "./AddTimeButton";
import { useTimerList } from "../data/TimerContext";
import {
    useAddTimeToTimer,
    useCreateTimer,
    useDeleteTimer,
    usePauseTimer,
    useResumeTimer,
} from "../data/queries";

function isValid(seconds) {
    return !isNaN(seconds) && seconds > 0;
}

function TimerDrawer({
                         open,
                         onClose,
                     }) {
    const { data: timers } = useTimerList();
    const [ seconds, setSeconds ] = useState(0);
    const [ doCreate ] = useCreateTimer();
    const [ doAddTime ] = useAddTimeToTimer();
    const [ doPause ] = usePauseTimer();
    const [ doResume ] = useResumeTimer();
    const [ doDelete ] = useDeleteTimer();

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            handleCreate();
        }
    }

    function handleCreate() {
        if (isValid(seconds)) {
            doCreate(seconds);
        }
        setSeconds(0);
    }

    return <Drawer
        anchor={"right"}
        open={open}
        onClose={onClose}
    >
        <List subheader={<ListSubheader>Timers</ListSubheader>}>
            {timers.map(it => <ListItem key={it.id}>
                <ListItemText primary={
                    <Grid container alignItems={"center"}
                          justifyContent={"flex-end"}>
                        <Box mx={1}>
                            <TimeLeft timer={it}
                                      overageIndicator={"+"} />
                        </Box>
                        <AddTimeButton
                            id={it.id}
                            seconds={60}
                            onClick={sec => doAddTime(it.id, sec)}
                        />
                        {it.paused
                            ? <IconButton onClick={() => doResume(it.id)}>
                                <PlayIcon />
                            </IconButton>
                            : <IconButton onClick={() => doPause(it.id)}>
                                <PauseIcon />
                            </IconButton>}
                        <IconButton onClick={() => doDelete(it.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                } />
            </ListItem>)}
        </List>
        <Box mx={1}>
            <Grid container>
                <Grid item>
                    <TextField
                        variant={"outlined"}
                        label={"New Timer"}
                        helperText={"Length in seconds"}
                        margin="dense"
                        type={"number"}
                        value={seconds === 0 ? "" : seconds}
                        onChange={e => setSeconds(parseInt(e.target.value))}
                        onKeyDown={handleKeyDown}
                        inputProps={{
                            step: 1,
                            min: 0,
                        }}
                    />
                </Grid>
                <Grid item>
                    <IconButton
                        onClick={handleCreate}
                        disabled={!isValid(seconds)}
                    >
                        <PlayIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </Box>
    </Drawer>;
}

TimerDrawer.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default TimerDrawer;
