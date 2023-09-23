import { Chip } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles((theme) => ({
    root: {
        marginRight: theme.spacing(1),
    },
}));

interface Props {
    label: string;
}

const LabelItem: React.FC<Props> = ({ label }) => {
    const classes = useStyles();
    return <Chip size="small" label={label} className={classes.root} />;
};

export default LabelItem;
