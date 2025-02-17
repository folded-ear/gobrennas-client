import { CopyIcon } from "@/views/common/icons";
import { IconButton, IconButtonProps, Tooltip } from "@mui/material";
import * as React from "react";

interface Props {
    title: string;
    onClick: IconButtonProps["onClick"];
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
