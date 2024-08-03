import { IconButton, IconButtonProps } from "@mui/material";
import React from "react";
import { LoadingIcon } from "./icons";

const LoadingIconButton: React.FC<IconButtonProps> = (props) => {
    return (
        <IconButton
            aria-label="loading"
            disabled
            sx={{
                "@keyframes spin": {
                    "0%": {
                        rotate: "0deg",
                    },
                    "100%": {
                        rotate: "360deg",
                    },
                },
                animation: "1.1s ease-in-out infinite spin",
            }}
            {...props}
        >
            <LoadingIcon />
        </IconButton>
    );
};

export default LoadingIconButton;
