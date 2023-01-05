import React from "react";
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
} from "@material-ui/core";
import {
    Delete as DeleteIcon,
    Pause as PauseIcon,
    PlayArrow as PlayIcon,
} from "@material-ui/icons";
import Countdown from "./Countdown";
import AddTimeButton from "./AddTimeButton";
import { arrayOfTimersType } from "../types/types";

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
                            <Countdown {...it} />
                        </Box>
                        <AddTimeButton
                            id={it.id}
                            seconds={60}
                            onClick={sec => onAddTime(it.id, sec)}
                        />
                        {it.paused
                            ? <IconButton onClick={() => onResume(it.id)}>
                                <PlayIcon />
                            </IconButton>
                            : <IconButton onClick={() => onPause(it.id)}>
                                <PauseIcon />
                            </IconButton>}
                        <IconButton onClick={() => onDelete(it.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </Grid>
                } />
            </ListItem>)}
        </List>
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
