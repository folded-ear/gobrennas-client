import React, {
    useEffect,
    useState,
} from "react";
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
    ListSubheader,
    makeStyles,
} from "@material-ui/core";
import {
    Add as AddIcon,
    Close as CloseIcon,
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

function TimerDrawer({
                         open,
                         onClose,
                     }) {
    const classes = useStyles();
    const [ showNew, setShowNew ] = useState(false);
    const { data: timers } = useTimerList();
    const [ doCreate ] = useCreateTimer();
    const [ doAddTime ] = useAddTimeToTimer();
    const [ doPause ] = usePauseTimer();
    const [ doResume ] = useResumeTimer();
    const [ doDelete ] = useDeleteTimer();

    useEffect(() => {
        if (!open) setShowNew(false);
    }, [ open ]);

    function handleCreate(seconds) {
        doCreate(seconds);
        setShowNew(false);
    }

    return <Drawer
        anchor={"right"}
        open={open}
        onClose={onClose}
    >
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
                    onClick={() => setShowNew(v => !v)}
                >
                    {showNew
                        ? <CloseIcon />
                        : <AddIcon />}
                </Fab>
            </ListSubheader>
            {showNew && <>
                <Box m={1}>
                    <NewTimer onCreate={handleCreate} />
                </Box>
                <Divider />
            </>}
            {timers.map(it => <ListItem key={it.id}>
                <ListItemText primary={
                    <Grid container
                          alignItems={"center"}
                          justifyContent={"flex-end"}>
                        <Box className={classes.display}>
                            <TimeLeft
                                timer={it}
                                overageIndicator={"+"}
                                progress
                            />
                        </Box>
                        <AddTimeButton
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
    </Drawer>;
}

TimerDrawer.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default TimerDrawer;
