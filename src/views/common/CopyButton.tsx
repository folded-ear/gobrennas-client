import { IconButton, Tooltip } from "@mui/material";
import { CopyIcon } from "views/common/icons";
import React, { MouseEventHandler } from "react";

interface Props {
    title: string;
    onClick: MouseEventHandler;
}

const CopyButton: React.FC<Props> = ({ title, onClick }) => {
    return (
        <Tooltip title={title} placement="top">
            <IconButton onClick={onClick}>
                <CopyIcon />
            </IconButton>
        </Tooltip>
    );
};

export default CopyButton;
