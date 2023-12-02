import { Tooltip } from "@mui/material";
import React, { MouseEventHandler } from "react";
import Dispatcher from "data/dispatcher";
import PlanActions from "features/Planner/data/PlanActions";
import PlanItemStatus, {
    getColorForStatus,
    getIconForStatus,
} from "features/Planner/data/PlanItemStatus";
import { coloredIconButton } from "views/common/colors";
import { BfsId } from "../../../global/types/types";

const buttonLookup = {}; // Map<next, Map<curr, Button>>
const findButton = (next, curr) => {
    if (!buttonLookup.hasOwnProperty(next)) {
        buttonLookup[next] = {};
    }
    if (!buttonLookup[next].hasOwnProperty(curr)) {
        buttonLookup[next][curr] = coloredIconButton(
            getColorForStatus(next),
            getColorForStatus(curr),
        );
    }
    return buttonLookup[next][curr];
};

interface Props {
    next: PlanItemStatus;
    current?: PlanItemStatus;
    id?: BfsId;
    onClick?: MouseEventHandler;
}

const StatusIconButton: React.FC<Props> = (props) => {
    const Btn = findButton(props.next, props.current || props.next);
    const Icn = getIconForStatus(props.next);
    return (
        <Tooltip
            title={`Mark ${props.next.substring(0, 1)}${props.next
                .substring(1)
                .toLowerCase()}`}
            disableInteractive
            enterDelay={750}
        >
            <Btn
                aria-label={props.next.toLowerCase()}
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    Dispatcher.dispatch({
                        type: PlanActions.SET_STATUS,
                        id: props.id,
                        status: props.next,
                    });
                }}
                {...props}
            >
                <Icn />
            </Btn>
        </Tooltip>
    );
};

export default StatusIconButton;
