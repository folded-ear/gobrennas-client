import PropTypes from "prop-types";
import React from "react";
import {
    getColorForStatus,
    getIconForStatus
} from "features/Planner/constants";
import { TaskStatus } from "features/Planner/types";
import { coloredIconNoOp } from "../../global/components/ColoredIconNoOp";

const buttonLookup = {}; // Map<next, Button>
const findButton = status => {
    if (!buttonLookup.hasOwnProperty(status)) {
        buttonLookup[status] = coloredIconNoOp(getColorForStatus(status));
    }
    return buttonLookup[status];
};

const StatusIconIndicator = props => {
    const Btn = findButton(props.status);
    const Icn = getIconForStatus(props.status);
    return <Btn
        aria-label={props.status.toLowerCase()}
        size="small"
        disableRipple
        disableFocusRipple
        {...props}
    >
        <Icn />
    </Btn>;
};

StatusIconIndicator.propTypes = {
    status: PropTypes.oneOf(Object.keys(TaskStatus)).isRequired,
};

export default StatusIconIndicator;
