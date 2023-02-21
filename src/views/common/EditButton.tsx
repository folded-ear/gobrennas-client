import {
    IconButton,
    Tooltip, TooltipProps,
} from "@material-ui/core";
import { Edit } from "@material-ui/icons";
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
