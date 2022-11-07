import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "data/dispatcher";
import TaskActions from "features/Planner/data/TaskActions";
import TaskStatus, { getColorForStatus } from "features/Planner/data/TaskStatus";
import { clientOrDatabaseIdType } from "util/ClientId";
import { coloredButton } from "views/common/colors";

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
};

export default DontChangeStatusButton;
