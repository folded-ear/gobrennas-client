import {
    Box,
    Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
    CameraAlt,
    MenuBook,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles({
    trigger: {
        position: "absolute",
        right: 0,
        zIndex: 1000,
        backgroundColor: "white",
        transformOrigin: "bottom right",
        transform: `rotate(90deg) translateY(100%) translateX(50%)`,
    },
});

const TextractButton = ({onClick}) => {
    const classes = useStyles();
    return <Box
        className={classes.trigger}
    >
        <Button
            variant={"text"}
            startIcon={<MenuBook />}
            endIcon={<CameraAlt />}
            size={"small"}
            onClick={onClick}
        >
            Cookbook
        </Button>
    </Box>;
};

TextractButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default TextractButton;
