import makeStyles from "@mui/styles/makeStyles";
import { Button } from "@mui/material";
import React from "react";

const useStyles = makeStyles({
    body: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
});

const TextButton = (({ children, ...props }) => {
    const classes = useStyles();
    return (
        <Button {...props}>
            <span className={classes.body}>{children}</span>
        </Button>
    );
}) as typeof Button;

export default TextButton;
