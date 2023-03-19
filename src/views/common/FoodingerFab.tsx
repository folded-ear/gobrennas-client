import Fab from "@mui/material/Fab";
import { makeStyles } from "@mui/styles";
import React, { PropsWithChildren } from "react";
import dispatcher from "../../data/dispatcher";
import UiActions from "../../data/UiActions";

const useStyles = makeStyles(theme => ({
    root: {
        position: "fixed",
        bottom: theme.spacing(3),
        right: theme.spacing(3),
    },
}));

type Props = PropsWithChildren<any>;

const FoodingerFab: React.FC<Props> = ({
                                           children,
                                           ...props
                                       }) => {
    const classes = useStyles();
    React.useEffect(() => {
        setTimeout(() => dispatcher.dispatch({
            type: UiActions.SHOW_FAB,
        }));
        return () => {
            setTimeout(() => dispatcher.dispatch({
                type: UiActions.HIDE_FAB,
            }));
        };
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

export default FoodingerFab;
