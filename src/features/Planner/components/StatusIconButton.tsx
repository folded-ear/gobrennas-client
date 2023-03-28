import { Tooltip } from "@mui/material";
import React, { MouseEventHandler } from "react";
import Dispatcher from "data/dispatcher";
import TaskActions from "features/Planner/data/TaskActions";
import TaskStatus, {
    getColorForStatus,
    getIconForStatus,
} from "features/Planner/data/TaskStatus";
import { coloredIconButton } from "views/common/colors";

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

interface CoreProps {
    current?: TaskStatus
    next: TaskStatus
}

interface TaskProps extends CoreProps {
    id: string | number
}

interface OpenProps extends CoreProps {
    onClick: MouseEventHandler
}

const StatusIconButton: React.FC<TaskProps | OpenProps> = props => {
    const Btn = findButton(props.next, props.current || props.next);
    const Icn = getIconForStatus(props.next);
    return <Tooltip
        title={`Mark ${props.next.substr(0, 1)}${props.next.substr(1).toLowerCase()}`}
    >
        <Btn
            aria-label={props.next.toLowerCase()}
            size="small"
            onClick={e => {
                e.stopPropagation();
                Dispatcher.dispatch({
                    type: TaskActions.SET_STATUS,
                    id: (props as TaskProps).id,
                    status: props.next,
                });
            }}
            {...props}
        >
            <Icn />
        </Btn>
    </Tooltip>;
};

export default StatusIconButton;