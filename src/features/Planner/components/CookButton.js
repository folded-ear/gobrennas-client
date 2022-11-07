import {
    IconButton,
    Tooltip,
} from "@material-ui/core";
import { Kitchen } from "@material-ui/icons";
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
            >
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
