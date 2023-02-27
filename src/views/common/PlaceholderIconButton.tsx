import { makeStyles } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import React from "react";
import { Blank } from "./icons";

const useStyles = makeStyles(({
    root: {
        visibility: "hidden",
    },
}));

const PlaceholderIconButton = props => {
    const classes = useStyles();
    return (
        <IconButton className={classes.root} disabled {...props} size="large">
            <Blank />
        </IconButton>
    );
};

export default PlaceholderIconButton;
