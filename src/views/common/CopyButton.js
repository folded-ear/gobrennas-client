import React from "react";
import PropTypes from "prop-types";
import {IconButton, Tooltip} from "@material-ui/core";
import {FileCopy} from "@material-ui/icons";

const CopyButton = ({mine, onClick}) => {
    return (
        <Tooltip
            title={mine ? "Copy" : "Duplicate to My Library"}
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
    mine: PropTypes.bool,
    onClick: PropTypes.func,
};

export default CopyButton;
