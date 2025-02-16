import Paper, { PaperProps } from "@mui/material/Paper";
import makeStyles from "@mui/styles/makeStyles";
import * as React from "react";

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1),
    },
}));

const SidebarUnit: React.FC<PaperProps> = ({ children, ...props }) => {
    const classes = useStyles();
    return (
        <Paper className={classes.root} {...props}>
            {children}
        </Paper>
    );
};

export default SidebarUnit;
