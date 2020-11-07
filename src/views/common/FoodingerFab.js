import Fab from "@material-ui/core/Fab";
import withStyles from "@material-ui/core/styles/withStyles";
import React from "react";

const FoodingerFab = withStyles(theme => ({
    root: {
        position: "fixed",
        bottom: theme.spacing(3),
        right: theme.spacing(3),
    },
}))(props => <Fab color="primary" aria-label="add" {...props} />);

export default FoodingerFab;
