import PropTypes from "prop-types";
import React from "react";
import TaskStatus from "../../data/TaskStatus";
import {
    colorByStatus,
    coloredButton,
} from "./colors";

const buttonLookup = {}; // Map<next, Button>
const findButton = next => {
    if (!buttonLookup.hasOwnProperty(next)) {
        buttonLookup[next] = coloredButton(colorByStatus[next]);
    }
    return buttonLookup[next];
};

const DontChangeStatusButton = props => {
    const Btn = findButton(props.next);
    return <Btn
        variant="contained"
        aria-label="wait-no"
        size="small"
        {...props}
    >
        WAIT, NO!
    </Btn>;
};

DontChangeStatusButton.propTypes = {
    next: PropTypes.oneOf(Object.keys(TaskStatus)).isRequired,
};

export default DontChangeStatusButton;
