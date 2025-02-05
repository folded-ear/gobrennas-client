import React from "react";
import dispatcher from "@/data/dispatcher";
import PlanActions from "@/features/Planner/data/PlanActions";
import PlanItemStatus, {
    getColorForStatus,
} from "@/features/Planner/data/PlanItemStatus";
import { coloredButton } from "@/views/common/colors";
import { BfsId } from "@/global/types/identity";
import { ButtonProps } from "@mui/material";

const buttonLookup = {}; // Map<next, Button>
const findButton = (next) => {
    if (!buttonLookup.hasOwnProperty(next)) {
        buttonLookup[next] = coloredButton(getColorForStatus(next));
    }
    return buttonLookup[next];
};

interface Props extends Omit<ButtonProps, "id"> {
    next: PlanItemStatus;
    id?: BfsId;
}

const DontChangeStatusButton: React.FC<Props> = ({ id, next, ...props }) => {
    const Btn = findButton(next);
    return (
        <Btn
            variant="contained"
            aria-label="wait-no"
            size="small"
            onClick={(e) => {
                e.stopPropagation();
                dispatcher.dispatch({
                    type: PlanActions.UNDO_SET_STATUS,
                    id,
                });
            }}
            {...props}
        >
            WAIT, NO!
        </Btn>
    );
};

export default DontChangeStatusButton;
