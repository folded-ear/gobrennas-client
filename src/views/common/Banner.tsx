import grey from "@mui/material/colors/grey";
import { HelpIcon, InfoIcon } from "views/common/icons";
import React, { MouseEventHandler, PropsWithChildren } from "react";
import CloseButton from "views/common/CloseButton";
import { lightBlue } from "@mui/material/colors";
import { Box } from "@mui/material";

interface Props extends PropsWithChildren<unknown> {
    severity?: "info";
    onClose?: MouseEventHandler;
}

const Banner: React.FC<Props> = ({ severity, children, onClose }) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            style={{
                backgroundColor:
                    severity === "info" ? lightBlue[100] : grey[200],
            }}
        >
            <Box m={1}>{severity === "info" ? <InfoIcon /> : <HelpIcon />}</Box>
            <Box flexGrow={1}>{children}</Box>
            {onClose && (
                <Box>
                    <CloseButton onClick={onClose} />
                </Box>
            )}
        </Box>
    );
};

export default Banner;
