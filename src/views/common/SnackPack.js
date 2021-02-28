import {
    IconButton,
    Snackbar,
} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Close as CloseIcon } from "@material-ui/icons";
import React from "react";
import dispatcher from "../../data/dispatcher";
import snackBarStore from "../../data/snackBarStore";
import UiActions from "../../data/UiActions";
import useFluxStore from "../../data/useFluxStore";

const useStyles = makeStyles(theme => ({
    snackbar: {
        [theme.breakpoints.down("xs")]: {
            bottom: 90,
        },
    },
}));

function SnackPack() {
    const classes = useStyles();
    const {
        fabVisible,
        queue,
    } = useFluxStore(
        () => snackBarStore.getState(),
        [snackBarStore],
    );
    const [snackPack, setSnackPack] = React.useState(queue);
    React.useEffect(() => setSnackPack(queue), [queue]);

    const [open, setOpen] = React.useState(false);
    const [messageInfo, setMessageInfo] = React.useState(undefined);

    React.useEffect(() => {
        if (snackPack.length && !messageInfo) {
            // Set a new snack when we don't have an active one
            setMessageInfo({ ...snackPack[0] });
            setSnackPack((prev) => prev.slice(1));
            setOpen(true);
        } else if (snackPack.length && messageInfo && open) {
            // Close an active snack when a new one is added
            setOpen(false);
        }
    }, [snackPack, messageInfo, open]);

    const handleClose = (event, reason) => {
        setOpen(false);
        messageInfo.onClose && messageInfo.onClose.call(undefined, event, reason);
        dispatcher.dispatch({
            type: UiActions.DISMISS_SNACKBAR,
            key: messageInfo.key,
        });
    };

    const handleExited = () => {
        setMessageInfo(undefined);
    };

    return <Snackbar
        key={messageInfo ? messageInfo.key : undefined}
        anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
        }}
        open={open}
        autoHideDuration={(messageInfo && messageInfo.hideDelay) || 5000}
        onClose={handleClose}
        onExited={handleExited}
        message={messageInfo ? messageInfo.message : undefined}
        className={fabVisible ? classes.snackbar : null}
        action={<>
            {messageInfo && messageInfo.renderAction ? messageInfo.renderAction(e => handleClose(e, "action")) : null}
            <IconButton
                aria-label="close"
                color="inherit"
                className={classes.close}
                onClick={handleClose}
            >
                <CloseIcon />
            </IconButton>
        </>}
    />;

}

export default SnackPack;
