import { IconButton, Tooltip, TooltipProps } from "@mui/material";
import React, { MouseEventHandler } from "react";
import { EditIcon } from "views/common/icons";

interface Props {
    tooltipPlacement?: TooltipProps["placement"];
    onClick: MouseEventHandler;
}

const EditButton: React.FC<Props> = ({ onClick, tooltipPlacement = "top" }) => {
    return (
        <Tooltip title="Edit" placement={tooltipPlacement}>
            <IconButton onClick={onClick}>
                <EditIcon />
            </IconButton>
        </Tooltip>
    );
};

export default EditButton;
