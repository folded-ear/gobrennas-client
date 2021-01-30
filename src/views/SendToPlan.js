import {
    Button,
    IconButton,
    Snackbar,
} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
    AddShoppingCart,
    ExitToApp,
} from "@material-ui/icons";
import React from "react";
import useActivePlannerLO from "../data/useActivePlannerLO";

const useStyles = makeStyles(theme => ({
    snackbar: {
        // SendToPlan is always shown w/ a FAB, don't need to make this extra
        // spacing conditional. Yet.
        [theme.breakpoints.down("xs")]: {
            bottom: 90,
        },
    },
}));

const SendToPlan = ({onClick, iconOnly, withToast = true}) => {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const listLO = useActivePlannerLO();
    if (!listLO.hasValue()) return null;
    const list = listLO.getValueEnforcing();
    const handleClick = () => {
        withToast && setOpen(true);
        onClick && onClick(list.id);
    };
    let result;
    if (iconOnly) {
        result = <IconButton
            size="small"
            onClick={handleClick}
            title={`Send to "${list.name}"`}
        >
            <AddShoppingCart fontSize="inherit" />
        </IconButton>;
    } else {
        result = <Button
            disableElevation
            variant="contained"
            color="secondary"
            onClick={handleClick}
            startIcon={<ExitToApp />}
        >
            <span
                style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
                title={`Send to ${list.name}`}
            >
                To {list.name}
            </span>
        </Button>;
    }
    if (withToast) {
        const handleClose = (event, reason) => {
            // incantation based on docs...
            if (reason === "clickaway") {
                return;
            }
            setOpen(false);
        };

        result = <>
            {result}
            <Snackbar
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                open={open}
                autoHideDuration={1500}
                onClose={handleClose}
                message={`Sent to ${list.name}!`}
                className={classes.snackbar}
            />
        </>;
    }
    return result;
};

export default SendToPlan;
