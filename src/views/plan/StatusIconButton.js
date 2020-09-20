import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import TaskActions from "../../data/TaskActions";
import TaskStatus, {
    getColorForStatus,
    getIconForStatus,
} from "../../data/TaskStatus";
import { clientOrDatabaseIdType } from "../../util/ClientId";
import { coloredIconButton } from "../common/colors";

const buttonLookup = {}; // Map<next, Map<curr, Button>>
const findButton = (next, curr) => {
    if (!buttonLookup.hasOwnProperty(next)) {
        buttonLookup[next] = {};
    }
    if (!buttonLookup[next].hasOwnProperty(curr)) {
        buttonLookup[next][curr] = coloredIconButton(
            getColorForStatus(next),
            getColorForStatus(curr));
    }
    return buttonLookup[next][curr];
};

const StatusIconButton = props => {
    const Btn = findButton(props.next, props.current || props.next);
    const Icn = getIconForStatus(props.next);
    return <Btn
        aria-label={props.next.toLowerCase()}
        size="small"
        onClick={e => {
            e.stopPropagation();
            Dispatcher.dispatch({
                type: TaskActions.SET_STATUS,
                id: props.id,
                status: props.next,
            });
        }}
        {...props}
    >
        <Icn />
    </Btn>;
};

StatusIconButton.propTypes = {
    id: clientOrDatabaseIdType,
    current: PropTypes.oneOf(Object.keys(TaskStatus)),
    next: PropTypes.oneOf(Object.keys(TaskStatus)).isRequired,
};

export default StatusIconButton;
