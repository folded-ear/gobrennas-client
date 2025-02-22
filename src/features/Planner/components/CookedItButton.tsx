import dispatcher, { ActionType } from "@/data/dispatcher";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import { FromPlanItem } from "@/global/types/types";
import { CookedItIcon, HelpIcon } from "@/views/common/icons";
import SplitButton, { SelectOption } from "@/views/common/SplitButton";
import { ButtonProps, Stack, Tooltip } from "@mui/material";
import { DateTime } from "luxon";
import * as React from "react";
import { useCallback } from "react";
import { useHistory } from "react-router-dom";

type Props = Omit<ButtonProps, "onClick"> & {
    recipe: FromPlanItem;
    stayOnPage?: boolean;
};

const CookButton: React.FC<Props> = ({ recipe, stayOnPage }) => {
    const history = useHistory();
    const pending = recipe.completing;
    const disabled =
        recipe.ancestorCompleting || recipe.deleting || recipe.ancestorDeleting;
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            dispatcher.dispatch({
                type: recipe.completing
                    ? ActionType.PLAN__UNDO_SET_STATUS
                    : ActionType.PLAN__COMPLETE_PLAN_ITEM,
                id: recipe.id,
                status: PlanItemStatus.COMPLETED,
                doneAt: new Date(),
            });
            if (!stayOnPage) history.goBack();
        },
        [history, recipe.completing, recipe.id, stayOnPage],
    );

    const handleSelect = React.useCallback(
        (e: React.MouseEvent, option: SelectOption<Date>) => {
            e.preventDefault();
            dispatcher.dispatch({
                type: ActionType.PLAN__COMPLETE_PLAN_ITEM,
                id: recipe.id,
                status: PlanItemStatus.COMPLETED,
                doneAt: option.value,
            });
            if (!stayOnPage) history.goBack();
        },
        [history, recipe.id, stayOnPage],
    );

    const cookedItOptions = React.useMemo(() => {
        const start = DateTime.now();
        const days = [...Array(7).keys()];
        const createLabel = (day: number) => {
            if (day === 0) {
                return "Today";
            }
            if (day === 1) {
                return "Yesterday";
            }
            return day + " Days Ago";
        };
        return days.map((day) => ({
            id: day.toString(),
            label: createLabel(day),
            value: start.minus({ days: day }).toJSDate(),
        }));
    }, []);

    const text = pending ? "WAIT, NO!" : "I Cooked It!";
    const title = pending
        ? text
        : "Mark this cooked and remove it from the plan.";
    return (
        <Stack
            justifyContent="center"
            alignItems="center"
            direction="row"
            spacing={1}
            sx={{ marginRight: "20px" }}
        >
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
            <Tooltip title={title} placement="top">
                <HelpIcon sx={{ fontSize: 16 }} />
            </Tooltip>
        </Stack>
    );
};

export default CookButton;
