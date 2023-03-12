import {IconButton, Tooltip,} from "@mui/material";
import {Kitchen} from "@mui/icons-material";
import PropTypes from "prop-types";
import React from "react";
import history from "util/history";

const CookButton = ({planId, taskId, ...props}) => {
    return (
        <Tooltip
            title="Cook / Kitchen View"
            placement="top"
        >
            <IconButton
                onClick={() => history.push(`/plan/${planId}/recipe/${taskId}`)}
                {...props}
                size="large">
                <Kitchen />
            </IconButton>
        </Tooltip>
    );
};

CookButton.propTypes = {
    planId: PropTypes.number.isRequired,
    taskId: PropTypes.number.isRequired,
};

export default CookButton;
