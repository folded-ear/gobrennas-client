import {
    IconButton,
    Tooltip,
    TooltipProps,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import PropTypes from "prop-types";
import React from "react";

const EditButton = ({
                        onClick,
                        tooltipPlacement = "top",
                    }) => {
    return (
        <Tooltip
            title="Edit"
            placement={tooltipPlacement as TooltipProps["placement"]}
        >
            <IconButton
                onClick={onClick}
            >
                <Edit />
            </IconButton>
        </Tooltip>
    );
};

EditButton.propTypes = {
    onClick: PropTypes.func,
    tooltipPlacement: PropTypes.string,
};

export default EditButton;
