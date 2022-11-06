import {
    Button,
    IconButton,
} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
    AddShoppingCart,
    ExitToApp,
} from "@material-ui/icons";
import React from "react";
import useActivePlannerLO from "../data/useActivePlannerLO";
import PropTypes from "prop-types";

const useStyles = makeStyles({
    button: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
});

const SendToPlan = ({onClick, iconOnly}) => {
    const classes = useStyles();
    const listLO = useActivePlannerLO();
    if (!listLO.hasValue()) return null;
    const list = listLO.getValueEnforcing();
    const handleClick = () =>
        onClick && onClick(list.id);
    if (iconOnly) {
        return <IconButton
            size="small"
            onClick={handleClick}
            title={`Send to "${list.name}"`}
        >
            <AddShoppingCart fontSize="inherit" />
        </IconButton>;
    } else {
        return <Button
            disableElevation
            variant="contained"
            color="secondary"
            onClick={handleClick}
            startIcon={<ExitToApp />}
        >
            <span
                className={classes.button}
                title={`Send to ${list.name}`}
            >
                To {list.name}
            </span>
        </Button>;
    }
};

SendToPlan.propTypes = {
    onClick: PropTypes.func.isRequired,
    iconOnly: PropTypes.bool,
};

export default SendToPlan;
