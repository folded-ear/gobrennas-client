import { CloseIcon } from "@/views/common/icons";
import { IconButton, IconButtonProps, Tooltip } from "@mui/material";
import * as React from "react";

interface Props {
    onClick: IconButtonProps["onClick"];
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
