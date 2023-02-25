import { Chip } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles((theme) => ({
    root: {
        marginRight: theme.spacing(1),
    },
}));

const LabelItem = ({label}) => {
    const classes = useStyles();
    return <Chip
        size="small"
        label={label}
        className={classes.root}
    />;
};

LabelItem.propTypes = {
    label: PropTypes.string
};

export default LabelItem;
