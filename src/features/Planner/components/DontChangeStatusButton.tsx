import dispatcher, { ActionType } from "@/data/dispatcher";
import PlanItemStatus, {
    getColorForStatus,
} from "@/features/Planner/data/PlanItemStatus";
import { BfsId } from "@/global/types/identity";
import { coloredButton } from "@/views/common/colors";
import { ButtonProps } from "@mui/material";
import * as React from "react";

const buttonLookup = new Map<
    PlanItemStatus,
    ReturnType<typeof coloredButton>
>();

function findButton(next: PlanItemStatus) {
    if (!buttonLookup.has(next)) {
        buttonLookup.set(next, coloredButton(getColorForStatus(next)));
    }
    // Type assertion is safe due to defaulting above.
    return buttonLookup.get(next)!;
}

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
            onClick={
                id && !props.onClick
                    ? (e) => {
                          e.stopPropagation();
                          dispatcher.dispatch({
                              type: ActionType.PLAN__UNDO_SET_STATUS,
                              id,
                          });
                      }
                    : undefined
            }
            {...props}
        >
            WAIT, NO!
        </Btn>
    );
};

export default DontChangeStatusButton;
