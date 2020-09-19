import {
    Check,
    DeleteForeverOutlined,
    QuestionAnswer,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import TaskStatus from "../../data/TaskStatus";
import {
    colorByStatus,
    coloredIconButton,
} from "./colors";

const buttonLookup = {}; // Map<next, Map<curr, Button>>
const findButton = (next, curr) => {
    if (!buttonLookup.hasOwnProperty(next)) {
        buttonLookup[next] = {};
    }
    if (!buttonLookup[next].hasOwnProperty(curr)) {
        buttonLookup[next][curr] = coloredIconButton(
            colorByStatus[next],
            colorByStatus[curr]);
    }
    return buttonLookup[next][curr];
};

const iconLookup = {
    [TaskStatus.ACQUIRED]: Check,
    [TaskStatus.COMPLETED]: Check,
    [TaskStatus.DELETED]: DeleteForeverOutlined,
};

/*
- button's at-rest color is based on current
- button's hover color is based on next
- icon is based on next
 */

const StatusIconButton = props => {
    const Btn = findButton(props.next, props.current || props.next);
    const Icn = iconLookup[props.next] || QuestionAnswer;
    return <Btn
        aria-label={props.next.toLowerCase()}
        size="small"
        {...props}
    >
        <Icn />
    </Btn>;
};

StatusIconButton.propTypes = {
    current: PropTypes.oneOf(Object.keys(TaskStatus)),
    next: PropTypes.oneOf(Object.keys(TaskStatus)).isRequired,
};

export default StatusIconButton;
