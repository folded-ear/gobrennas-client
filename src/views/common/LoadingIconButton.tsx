import {
    CircularProgress,
    IconButton,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import { grey } from "@mui/material/colors";
import React from "react";
import { MUISize } from "global/types/types";

const CircProg = withStyles({
    root: {
        color: grey[400],
    },
})(CircularProgress);

type ProgressProps = {
    size?: number;
    style?: any;
}

interface Props {
    size?: MUISize,
}

const LoadingIconButton: React.FC<Props> = ({
                                                size = "small",
                                                ...props
                                            }) => {
    // this is _weak_.
    const cpProps: ProgressProps = {};
    if (size === "small") {
        cpProps.size = 24;
        cpProps.style = {
            width: "24px",
        };
    }
    // this is admittedly pretty silly. ok, really silly.
    return <IconButton
        aria-label="loading"
        size={size}
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
