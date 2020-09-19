import {
    Check,
    DeleteForeverOutlined,
    QuestionAnswer,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import TaskActions from "../../data/TaskActions";
import TaskStatus, { colorByStatus } from "../../data/TaskStatus";
import { clientOrDatabaseIdType } from "../../util/ClientId";
import { coloredIconButton } from "../common/colors";

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

const StatusIconButton = props => {
    const Btn = findButton(props.next, props.current || props.next);
    const Icn = iconLookup[props.next] || QuestionAnswer;
    return <Btn
        aria-label={props.next.toLowerCase()}
        size="small"
        onClick={e => {
            e.stopPropagation();
            Dispatcher.dispatch({
                type: TaskActions.SET_STATUS,
                id: props.id,
                status: props.next,
                focusDelta: 1,
            });
        }}
        {...props}
    >
        <Icn />
    </Btn>;
};

StatusIconButton.propTypes = {
    id: clientOrDatabaseIdType.isRequired,
    current: PropTypes.oneOf(Object.keys(TaskStatus)),
    next: PropTypes.oneOf(Object.keys(TaskStatus)).isRequired,
};

export default StatusIconButton;
