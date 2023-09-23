import React, { MouseEventHandler } from "react";
import {
  IconButton,
  Tooltip
} from "@mui/material";
import { Close } from "@mui/icons-material";

interface Props {
    onClick?: MouseEventHandler;
}

const CloseButton: React.FC<Props> = ({ onClick }) => {
    return (
        <Tooltip title="Close" placement="top">
            <IconButton onClick={onClick}>
                <Close />
            </IconButton>
        </Tooltip>
    );
};

export default CloseButton;
