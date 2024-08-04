import { IconButton, Tooltip } from "@mui/material";
import React, { MouseEventHandler } from "react";
import Dispatcher from "data/dispatcher";
import PlanActions from "features/Planner/data/PlanActions";
import PlanItemStatus, {
    getColorForStatus,
    getIconForStatus,
} from "features/Planner/data/PlanItemStatus";
import { coloredIconButton } from "views/common/colors";
import { BfsId } from "global/types/identity";

const buttonLookup = {};
function findButton(
    next: PlanItemStatus,
    curr: PlanItemStatus,
): typeof IconButton {
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
}

interface Props {
    next: PlanItemStatus;
    current?: PlanItemStatus;
    id?: BfsId;
    onClick?: MouseEventHandler;
}

const StatusIconButton: React.FC<Props> = ({ next, current, id, ...props }) => {
    const Btn = findButton(next, current || next);
    const Icn = getIconForStatus(next);
    return (
        <Tooltip
            title={`Mark ${next.substring(0, 1)}${next
                .substring(1)
                .toLowerCase()}`}
            disableInteractive
            enterDelay={750}
        >
            <Btn
                aria-label={next.toLowerCase()}
                size="small"
                onClick={(e) => {
                    e.stopPropagation();
                    Dispatcher.dispatch({
                        type: PlanActions.SET_STATUS,
                        id: id,
                        status: next,
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
