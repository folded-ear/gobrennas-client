import {
    CircularProgress,
    IconButton,
    withStyles,
} from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import React from "react";

const CircProg = withStyles({
    root: {
        color: grey[400],
    },
})(CircularProgress);

const LoadingIconButton = props => {
    // this is _weak_.
    const cpProps = {};
    // eslint-disable-next-line react/prop-types
    if (props.size === "small") {
        cpProps.size = 22;
    }
    // this is admittedly pretty silly. ok, really silly.
    return <IconButton
        aria-label="loading"
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

export default LoadingIconButton;