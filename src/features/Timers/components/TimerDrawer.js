import React from "react";
import PropTypes from "prop-types";
import {
    Box,
    Divider,
    Drawer,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListSubheader,
    makeStyles,
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
    useDeleteTimer,
    usePauseTimer,
    useResumeTimer,
} from "../data/queries";
import NewTimer from "./NewTimer";

const useStyles = makeStyles((theme) => ({
    root: {
        minWidth: "20em",
    },
    heading: {
        backgroundColor: theme.palette.background.paper,
    },
}));

function TimerDrawer({
                         open,
                         onClose,
                     }) {
    const classes = useStyles();
    const { data: timers } = useTimerList();
    const [ doAddTime ] = useAddTimeToTimer();
    const [ doPause ] = usePauseTimer();
    const [ doResume ] = useResumeTimer();
    const [ doDelete ] = useDeleteTimer();

    return <Drawer
        anchor={"right"}
        open={open}
        onClose={onClose}
    >
        <List className={classes.root}>
            <ListSubheader className={classes.heading}>Timers</ListSubheader>
            {timers.map(it => <ListItem key={it.id}>
                <ListItemText primary={
                    <Grid container
                          alignItems={"center"}
                          justifyContent={"space-between"}>
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
        <Divider />
        <Box mx={1}>
            <NewTimer />
        </Box>
    </Drawer>;
}

TimerDrawer.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default TimerDrawer;
