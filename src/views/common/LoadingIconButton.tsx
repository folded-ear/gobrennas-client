import {
    CircularProgress,
    IconButton,
    withStyles,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import PropTypes from "prop-types";
import React from "react";
import {MUISize} from "../../types";

const CircProg = withStyles({
    root: {
        color: grey[400],
    },
})(CircularProgress);

type ProgressProps = {
    size?: number;
    style?: any;
}

const LoadingIconButton = ({size = "small", ...props}) => {
    // this is _weak_.
    const cpProps : ProgressProps = {};
    if (size === "small") {
        cpProps.size = 24;
        cpProps.style = {
            width: "24px",
        };
    }
    // this is admittedly pretty silly. ok, really silly.
    return <IconButton
        aria-label="loading"
        size={size as MUISize}
        disabled
        {...props}
    >
        <CircProg
            thickness={5}
            disableShrink
            {...cpProps}
        />
    </IconButton>;
};

LoadingIconButton.propTypes = {
    size: PropTypes.oneOf(["small", "medium"]),
};

export default LoadingIconButton;