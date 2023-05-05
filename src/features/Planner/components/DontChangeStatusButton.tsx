import React, { MouseEventHandler } from "react";
import Dispatcher from "data/dispatcher";
import PlanActions from "features/Planner/data/PlanActions";
import PlanItemStatus, { getColorForStatus } from "features/Planner/data/PlanItemStatus";
import { coloredButton } from "views/common/colors";

const buttonLookup = {}; // Map<next, Button>
const findButton = next => {
    if (!buttonLookup.hasOwnProperty(next)) {
        buttonLookup[next] = coloredButton(getColorForStatus(next));
    }
    return buttonLookup[next];
};

interface Props {
    next: PlanItemStatus
    id?: string | number
    onClick?: MouseEventHandler
}

const DontChangeStatusButton: React.FC<Props> = props => {
    const Btn = findButton(props.next);
    return <Btn
        variant="contained"
        aria-label="wait-no"
        size="small"
        onClick={e => {
            e.stopPropagation();
            Dispatcher.dispatch({
                type: PlanActions.UNDO_SET_STATUS,
                id: props.id,
            });
        }}
        {...props}
    >
        WAIT, NO!
    </Btn>;
};

export default DontChangeStatusButton;
