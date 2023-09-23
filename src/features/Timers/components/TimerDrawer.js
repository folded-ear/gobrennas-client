import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
    Box,
    Divider,
    Drawer,
    Fab,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListSubheader
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Pause as PauseIcon,
    PlayArrow as PlayIcon
} from "@mui/icons-material";
import TimeLeft from "./TimeLeft";
import AddTimeButton from "./AddTimeButton";
import { useTimerList } from "../data/TimerContext";
import { useAddTimeToTimer, useCreateTimer, useDeleteTimer, usePauseTimer, useResumeTimer } from "../data/queries";
import NewTimer from "./NewTimer";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "24em",
        maxWidth: "75vw",
    },
    fab: {
        position: "absolute",
        right: theme.spacing(1),
    },
    heading: {
        fontSize: 18,
        backgroundColor: theme.palette.background.paper,
    },
    display: {
        fontSize: 20,
        flexGrow: 1,
        textAlign: "right",
        marginRight: theme.spacing(1),
    },
}));

function TimerDrawer({ open, onClose }) {
    const classes = useStyles();
    const [showNew, setShowNew] = useState(false);
    const { data: timers } = useTimerList();
    const [doCreate] = useCreateTimer();
    const [doAddTime] = useAddTimeToTimer();
    const [doPause] = usePauseTimer();
    const [doResume] = useResumeTimer();
    const [doDelete] = useDeleteTimer();

    useEffect(() => {
        setShowNew(open && timers.length === 0);
    }, [open, timers.length]);

    function handleFab() {
        if (timers.length === 0) {
            onClose();
        } else {
            setShowNew((v) => !v);
        }
    }

    return (
        <Drawer anchor={"right"} open={open} onClose={onClose}>
            <List className={classes.root}>
                <ListSubheader className={classes.heading}>
                    {timers.length === 0
                        ? "Set Timer"
                        : timers.length === 1
                        ? "Timer"
                        : "Timers"}
                    <Fab
                        className={classes.fab}
                        size={"small"}
                        onClick={handleFab}
                        title={
                            showNew ? "Close timer form" : "Create a new timer"
                        }
                    >
                        {showNew ? <CloseIcon /> : <AddIcon />}
                    </Fab>
                </ListSubheader>
                {showNew && (
                    <>
                        <Box m={1}>
                            <NewTimer onCreate={doCreate} />
                        </Box>
                        <Divider />
                    </>
                )}
                {timers.map((it) => (
                    <ListItem key={it.id}>
                        <ListItemText
                            primary={
                                <Grid
                                    container
                                    alignItems={"center"}
                                    justifyContent={"flex-end"}
                                >
                                    <Box className={classes.display}>
                                        <TimeLeft
                                            timer={it}
                                            overageIndicator={"+"}
                                            progress
                                        />
                                    </Box>
                                    <AddTimeButton
                                        seconds={60}
                                        onClick={(sec) => doAddTime(it.id, sec)}
                                    />
                                    {it.paused ? (
                                        <IconButton
                                            title="Resume timer"
                                            onClick={() => doResume(it.id)}
                                            size="large"
                                        >
                                            <PlayIcon />
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            title="Pause timer"
                                            onClick={() => doPause(it.id)}
                                            size="large"
                                        >
                                            <PauseIcon />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        title="Delete timer"
                                        onClick={() => doDelete(it.id)}
                                        size="large"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Grid>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
}

TimerDrawer.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default TimerDrawer;
