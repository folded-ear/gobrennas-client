import Paper from "@mui/material/Paper";
import makeStyles from "@mui/styles/makeStyles";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: "white",
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1),
    },
}));

const SidebarUnit = ({children, ...props}) => {
    const classes = useStyles();
    return <Paper
        className={classes.root}
        {...props}
    >
        {children}
    </Paper>;
};

SidebarUnit.propTypes = {
    children: PropTypes.node,
};

export default SidebarUnit;
