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
import { arrayOfTimersType } from "../types/types";

function isValid(seconds) {
    return !isNaN(seconds) && seconds > 0;
}

function TimerDrawer({
                         timers,
                         open,
                         onClose,
                         onCreate,
                         onAddTime,
                         onPause,
                         onResume,
                         onDelete,
                     }) {

    const [ seconds, setSeconds ] = useState(0);

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            handleCreate();
        }
    }

    function handleCreate() {
        if (isValid(seconds)) {
            onCreate(seconds);
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
                            onClick={sec => onAddTime(it, sec)}
                        />
                        {it.paused
                            ? <IconButton onClick={() => onResume(it)}>
                                <PlayIcon />
                            </IconButton>
                            : <IconButton onClick={() => onPause(it)}>
                                <PauseIcon />
                            </IconButton>}
                        <IconButton onClick={() => onDelete(it)}>
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
    timers: arrayOfTimersType,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onCreate: PropTypes.func.isRequired,
    onAddTime: PropTypes.func.isRequired,
    onPause: PropTypes.func.isRequired,
    onResume: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default TimerDrawer;
