import {
  IconButton,
  Tooltip
} from "@mui/material";
import { FileCopy } from "@mui/icons-material";
import React, { MouseEventHandler } from "react";

interface Props {
    title: string;
    onClick: MouseEventHandler;
}

const CopyButton: React.FC<Props> = ({ title, onClick }) => {
    return (
        <Tooltip title={title} placement="top">
            <IconButton onClick={onClick}>
                <FileCopy />
            </IconButton>
        </Tooltip>
    );
};

export default CopyButton;
