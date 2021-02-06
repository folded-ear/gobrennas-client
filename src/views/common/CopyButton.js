import {
    IconButton,
    Tooltip,
} from "@material-ui/core";
import { FileCopy } from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";

const CopyButton = ({title, onClick}) => {
    return (
        <Tooltip
            title={title}
            placement="top"
        >
            <IconButton
                onClick={onClick}
            >
                <FileCopy/>
            </IconButton>
        </Tooltip>
    );
};
CopyButton.propTypes = {
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

export default CopyButton;
