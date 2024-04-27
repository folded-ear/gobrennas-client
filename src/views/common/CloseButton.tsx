import React, { MouseEventHandler } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { CloseIcon } from "views/common/icons";

interface Props {
    onClick?: MouseEventHandler;
}

const CloseButton: React.FC<Props> = ({ onClick }) => {
    return (
        <Tooltip title="Close" placement="top">
            <IconButton onClick={onClick}>
                <CloseIcon />
            </IconButton>
        </Tooltip>
    );
};

export default CloseButton;
