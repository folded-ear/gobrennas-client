import Fab from "@material-ui/core/Fab";
import makeStyles from "@material-ui/core/styles/makeStyles";
import PropTypes from "prop-types";
import React from "react";
import dispatcher from "../../data/dispatcher";
import UiActions from "../../data/UiActions";

const useStyles = makeStyles(theme => ({
    root: {
        position: "fixed",
        bottom: theme.spacing(3),
        right: theme.spacing(3),
    },
}));

const FoodingerFab = ({children, ...props}) => {
    const classes = useStyles();
    React.useEffect(() => {
        setTimeout(() => dispatcher.dispatch({
            type: UiActions.SHOW_FAB,
        }));
        return () => setTimeout(() => dispatcher.dispatch({
            type: UiActions.HIDE_FAB,
        }));
    }, []);
    return <Fab
        color="primary"
        className={classes.root}
        aria-label="add"
        {...props}
    >
        {children}
    </Fab>;
};

FoodingerFab.propTypes = {
    children: PropTypes.node.isRequired,
};

export default FoodingerFab;
