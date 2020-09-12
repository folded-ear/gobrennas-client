import { makeStyles } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import React from "react";
import { Blank } from "./icons";

const useStyles = makeStyles(({
    root: {
        visibility: "hidden",
    },
}));

const PlaceholderIconButton = props => {
    const classes = useStyles();
    return <IconButton
        className={classes.root}
        disabled
        {...props}
    >
        <Blank />
    </IconButton>;
};

export default PlaceholderIconButton;
