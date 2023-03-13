import React from "react";
import PropTypes from "prop-types";
import {
    IconButton,
    Tooltip
} from "@mui/material";
import { Close } from "@mui/icons-material";

const CloseButton = ({onClick}) => {
    return (
        <Tooltip
            title="Close"
            placement="top"
        >
            <IconButton
                onClick={onClick}
            >
                <Close/>
            </IconButton>
        </Tooltip>
    );
};

CloseButton.propTypes = {
    onClick: PropTypes.func,
    size: PropTypes.string,
};

export default CloseButton;
