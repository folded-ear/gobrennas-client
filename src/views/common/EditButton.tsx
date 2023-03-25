import {
    IconButton,
    Tooltip,
    TooltipProps,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import React, { MouseEventHandler } from "react";

interface Props {
    tooltipPlacement?: TooltipProps["placement"],
    onClick: MouseEventHandler,
}

const EditButton: React.FC<Props> = ({
                                         onClick,
                                         tooltipPlacement = "top",
                                     }) => {
    return (
        <Tooltip
            title="Edit"
            placement={tooltipPlacement}
        >
            <IconButton
                onClick={onClick}
            >
                <Edit />
            </IconButton>
        </Tooltip>
    );
};

export default EditButton;
