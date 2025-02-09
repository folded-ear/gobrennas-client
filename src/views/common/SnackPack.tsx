import React from "react";
import { Alert, IconButton, Snackbar } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { CloseIcon } from "@/views/common/icons";
import dispatcher, { ActionType } from "@/data/dispatcher";
import snackBarStore, { Snack } from "@/data/snackBarStore";
import useFluxStore from "@/data/useFluxStore";
import { SnackbarCloseReason } from "@mui/material/Snackbar/Snackbar";

const useStyles = makeStyles(() => ({
    close: {
        fontWeight: "normal",
    },
}));

function SnackPack() {
    const classes = useStyles();
    const { fabVisible, queue } = useFluxStore(
        () => snackBarStore.getState(),
        [snackBarStore],
    );
    const [snackPack, setSnackPack] = React.useState(queue);
    React.useEffect(() => setSnackPack(queue), [queue]);

    const [open, setOpen] = React.useState(false);
    const [messageInfo, setMessageInfo] = React.useState<Snack | undefined>();

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

    if (!messageInfo) return null;

    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => {
        setOpen(false);
        messageInfo.onClose &&
            messageInfo.onClose.call(undefined, event, reason);
        dispatcher.dispatch({
            type: ActionType.UI__DISMISS_SNACKBAR,
            key: messageInfo.key,
        });
    };

    const handleClickToClose: React.MouseEventHandler = (event) => {
        setOpen(false);
        messageInfo.onClose &&
            messageInfo.onClose.call(undefined, event, "clickaway");
        dispatcher.dispatch({
            type: ActionType.UI__DISMISS_SNACKBAR,
            key: messageInfo.key,
        });
    };

    const handleExited = () => {
        setMessageInfo(undefined);
    };

    let message, children;
    if (messageInfo.severity) {
        children = (
            <Alert severity={messageInfo.severity}>{messageInfo.message}</Alert>
        );
    } else {
        message = messageInfo.message;
    }

    return (
        <Snackbar
            key={messageInfo.key}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            open={open}
            autoHideDuration={messageInfo.hideDelay || 5000}
            onClose={handleClose}
            message={message}
            sx={fabVisible ? { bottom: [90, 0] } : undefined}
            action={
                <>
                    {messageInfo.renderAction
                        ? messageInfo.renderAction((e) =>
                              handleClose(e, "timeout"),
                          )
                        : null}
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        className={classes.close}
                        onClick={handleClickToClose}
                        size="large"
                    >
                        <CloseIcon />
                    </IconButton>
                </>
            }
            TransitionProps={{
                onExited: handleExited,
            }}
        >
            {children}
        </Snackbar>
    );
}

export default SnackPack;
