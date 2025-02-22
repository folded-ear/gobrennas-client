import { EditIcon } from "@/views/common/icons";
import {
    IconButton,
    IconButtonProps,
    Tooltip,
    TooltipProps,
} from "@mui/material";
import * as React from "react";

interface Props {
    tooltipPlacement?: TooltipProps["placement"];
    onClick: IconButtonProps["onClick"];
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
