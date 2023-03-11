import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "data/dispatcher";
import TaskActions from "features/Planner/data/TaskActions";
import {clientOrDatabaseIdType} from "util/ClientId";
import {getColorForStatus} from "features/Planner/constants";
import {coloredButton} from "global/components/ColoredButton";
import {TaskStatus} from "../types";

const buttonLookup = {}; // Map<next, Button>
const findButton = next => {
    if (!buttonLookup.hasOwnProperty(next)) {
        buttonLookup[next] = coloredButton(getColorForStatus(next));
    }
    return buttonLookup[next];
};

const DontChangeStatusButton = props => {
    const Btn = findButton(props.next);
    return <Btn
        variant="contained"
        aria-label="wait-no"
        size="small"
        onClick={e => {
            e.stopPropagation();
            Dispatcher.dispatch({
                type: TaskActions.UNDO_SET_STATUS,
                id: props.id,
            });
        }}
        {...props}
    >
        WAIT, NO!
    </Btn>;
};

DontChangeStatusButton.propTypes = {
    id: clientOrDatabaseIdType,
    next: PropTypes.oneOf(Object.keys(TaskStatus)).isRequired,
    onClick: PropTypes.func
};

export default DontChangeStatusButton;
