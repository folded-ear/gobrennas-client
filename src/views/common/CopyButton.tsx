import {
    IconButton,
    Tooltip,
} from "@mui/material";
import { FileCopy } from "@mui/icons-material";
import React from "react";

interface Props {
    title: string
    onClick: (MouseEvent) => void
}

const CopyButton: React.FC<Props> = ({ title, onClick }) => {
    return (
        <Tooltip
            title={title}
            placement="top"
        >
            <IconButton
                onClick={onClick}
            >
                <FileCopy />
            </IconButton>
        </Tooltip>
    );
};

export default CopyButton;
