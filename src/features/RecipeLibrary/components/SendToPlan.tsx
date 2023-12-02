import { Button, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { AddShoppingCart, ExitToApp } from "@mui/icons-material";
import React from "react";
import useActivePlanner from "data/useActivePlanner";

const useStyles = makeStyles({
    button: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
});

interface Props {
    onClick(planId: number): void;
    iconOnly?: boolean;
}

const SendToPlan: React.FC<Props> = ({ onClick, iconOnly }) => {
    const classes = useStyles();
    const list = useActivePlanner().data;
    if (!list) return null;
    const handleClick = () =>
        // While items can exist in the store in an unsaved state, plans
        // cannot, so this type assertion is safe.
        onClick && onClick(list.id as number);
    if (iconOnly) {
        return (
            <IconButton
                size="small"
                onClick={handleClick}
                title={`Send to "${list.name}"`}
            >
                <AddShoppingCart fontSize="inherit" />
            </IconButton>
        );
    } else {
        return (
            <Button
                disableElevation
                variant="contained"
                color="secondary"
                onClick={handleClick}
                startIcon={<ExitToApp />}
            >
                <span className={classes.button} title={`Send to ${list.name}`}>
                    To {list.name}
                </span>
            </Button>
        );
    }
};

export default SendToPlan;
