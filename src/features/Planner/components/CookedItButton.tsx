import { Button, ButtonProps, Tooltip } from "@mui/material";
import { CookedItIcon } from "views/common/icons";
import React, { useCallback } from "react";
import { FromPlanItem } from "../../../global/types/types";
import dispatcher from "../../../data/dispatcher";
import PlanActions from "../data/PlanActions";
import PlanItemStatus from "../data/PlanItemStatus";
import history from "util/history";

type Props = Omit<ButtonProps, "onClick"> & {
    recipe: FromPlanItem;
};

const CookButton: React.FC<Props> = ({ recipe, ...props }) => {
    const pending = recipe.completing;
    const disabled =
        recipe.ancestorCompleting || recipe.deleting || recipe.ancestorDeleting;
    const handleClick = useCallback(
        (e) => {
            e.preventDefault();
            dispatcher.dispatch({
                type: recipe.completing
                    ? PlanActions.UNDO_SET_STATUS
                    : PlanActions.SET_STATUS,
                id: recipe.id,
                status: PlanItemStatus.COMPLETED,
            });
            history.goBack();
        },
        [recipe.completing, recipe.id],
    );

    const text = pending ? "WAIT, NO!" : "I Cooked It!";
    const title = pending
        ? text
        : "Mark this cooked and remove it from the plan.";
    return (
        <Tooltip title={title} placement="bottom">
            <Button
                color={"success"}
                startIcon={<CookedItIcon />}
                disabled={disabled}
                onClick={handleClick}
                variant={pending ? "contained" : "outlined"}
                size={"small"}
                {...props}
            >
                {text}
            </Button>
        </Tooltip>
    );
};

export default CookButton;
