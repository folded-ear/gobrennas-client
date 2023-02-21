import * as React from "react";
import {
    IconButton,
    Snackbar,
} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Close as CloseIcon } from "@material-ui/icons";
import {Alert, Color} from "@material-ui/lab";
import dispatcher from "../../data/dispatcher";
import snackBarStore from "../../data/snackBarStore";
import UiActions from "../../data/UiActions";
import useFluxStore from "../../data/useFluxStore";
import {SnackbarCloseReason} from "@material-ui/core/Snackbar/Snackbar";

const useStyles = makeStyles(theme => ({
    snackbar: {
        [theme.breakpoints.down("xs")]: {
            bottom: 90,
        },
    },
    close: {
        fontWeight: "normal"
    }
}));

type MessageInfo = {
    renderAction: any;
    key: string;
    message: string;
    onClose: (event: React.SyntheticEvent<any>, reason: SnackbarCloseReason) => void;
    severity: Color;
    hideDelay?: number;
} | undefined

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
    const [messageInfo, setMessageInfo] = React.useState<MessageInfo>(undefined);

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

    const handleClose = (event: React.SyntheticEvent<any>, reason: SnackbarCloseReason) => {
        setOpen(false);
        messageInfo.onClose && messageInfo.onClose.call(undefined, event, reason);
        dispatcher.dispatch({
            type: UiActions.DISMISS_SNACKBAR,
            key: messageInfo.key,
        });
    };

    const handleClickToClose : React.MouseEventHandler = (event) => {
        setOpen(false);
        messageInfo.onClose && messageInfo.onClose.call(undefined, event, "clickaway");
        dispatcher.dispatch({
            type: UiActions.DISMISS_SNACKBAR,
            key: messageInfo.key,
        });
    };

    const handleExited = () => {
        setMessageInfo(undefined);
    };

    let message, children;
    if (messageInfo.severity) {
        children = <Alert
            severity={messageInfo.severity}
        >
            {messageInfo.message}
        </Alert>;
    } else /*if (messageInfo)*/ {
        message = messageInfo.message;
    }

    return <Snackbar
        key={messageInfo.key}
        anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
        }}
        open={open}
        autoHideDuration={messageInfo.hideDelay || 5000}
        onClose={handleClose}
        onExited={handleExited}
        message={message}
        className={fabVisible ? classes.snackbar : undefined}
        action={<>
            {messageInfo.renderAction ? messageInfo.renderAction(e => handleClose(e, "timeout")) : null}
            <IconButton
                aria-label="close"
                color="inherit"
                className={classes.close}
                onClick={handleClickToClose}
            >
                <CloseIcon />
            </IconButton>
        </>}
    >
        {children}
    </Snackbar>;

}

export default SnackPack;
