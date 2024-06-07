import { ButtonProps, Tooltip } from "@mui/material";
import { CookedItIcon } from "views/common/icons";
import React, { useCallback } from "react";
import { FromPlanItem } from "../../../global/types/types";
import dispatcher from "../../../data/dispatcher";
import PlanActions from "../data/PlanActions";
import PlanItemStatus from "../data/PlanItemStatus";
import history from "util/history";
import SplitButton, { SelectOption } from "views/common/SplitButton";

type Props = Omit<ButtonProps, "onClick"> & {
    recipe: FromPlanItem;
    stayOnPage?: boolean;
};

const CookButton: React.FC<Props> = ({ recipe, stayOnPage, ...props }) => {
    const pending = recipe.completing;
    const disabled =
        recipe.ancestorCompleting || recipe.deleting || recipe.ancestorDeleting;
    const handleClick = useCallback(
        (e) => {
            e.preventDefault();
            dispatcher.dispatch({
                type: recipe.completing
                    ? PlanActions.UNDO_SET_STATUS
                    : PlanActions.COMPLETE_PLAN_ITEM,
                id: recipe.id,
                status: PlanItemStatus.COMPLETED,
                doneAt: new Date(),
            });
            if (!stayOnPage) history.goBack();
        },
        [recipe.completing, recipe.id, stayOnPage],
    );

    const handleSelect = (e, option: SelectOption) => {
        console.log(e);
        console.log(option);
    };

    const cookedItOptions = React.useMemo(() => {
        return [
            {
                id: 1,
                label: "Yesterday",
                value: "2024-06-04T22:53:49.361Z",
            },
        ];
    }, []);

    const text = pending ? "WAIT, NO!" : "I Cooked It!";
    const title = pending
        ? text
        : "Mark this cooked and remove it from the plan.";
    return (
        <Tooltip title={title} placement="top">
            <SplitButton
                variant={pending ? "contained" : "outlined"}
                color={"success"}
                disabled={disabled}
                onClick={handleClick}
                onSelect={handleSelect}
                startIcon={<CookedItIcon />}
                primary={text}
                options={cookedItOptions}
            />
        </Tooltip>
    );
};

export default CookButton;
