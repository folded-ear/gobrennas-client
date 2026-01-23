import useActivePlanner from "@/data/useActivePlanner";
import { Plan } from "@/features/Planner/data/planStore";
import { TaskBarButton } from "@/global/elements/taskbar.elements";
import { BfsId } from "@/global/types/identity";
import { SCALE_OPTIONS } from "@/util/ScalingContext";
import { SendToPlanIcon } from "@/views/common/icons";
import SplitButton, { SelectOption } from "@/views/common/SplitButton";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import * as React from "react";

const SendToPlanWrapper = styled("div")({
    width: "100%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
});

interface PropsWithScale {
    onClick(planId: BfsId, scale?: number | null): void;
    plan: Plan;
}

const SendToPlanWithScaleOptions: React.FC<PropsWithScale> = ({
    onClick,
    plan,
}) => {
    const scaleToPlanOpts = SCALE_OPTIONS.map((it) => ({
        id: it.label,
        label: it.label,
        value: it.value,
    }));

    const handleClick = () => onClick && onClick(plan.id);

    const handleSelect = (_: never, selected: SelectOption<number>) => {
        if (onClick) onClick(plan.id, selected?.value);
    };

    return (
        <SplitButton
            disableElevation
            primary={`To ${plan.name}`}
            onClick={handleClick}
            options={scaleToPlanOpts}
            color="neutral"
            variant="contained"
            onSelect={handleSelect}
            startIcon={<SendToPlanIcon />}
        />
    );
};

interface Props {
    onClick(planId: BfsId, scale?: number | null): void;
    iconOnly?: boolean;
    showScaleOptions?: boolean;
}

const SendToPlan: React.FC<Props> = ({
    onClick,
    iconOnly,
    showScaleOptions = false,
}) => {
    const plan = useActivePlanner().data;
    if (!plan) return null;

    const handleClick = () => onClick && onClick(plan.id);

    if (iconOnly) {
        return (
            <TaskBarButton
                onClick={handleClick}
                title={`Send to "${plan.name}"`}
            >
                <SendToPlanIcon />
            </TaskBarButton>
        );
    }

    if (showScaleOptions) {
        return <SendToPlanWithScaleOptions onClick={onClick} plan={plan} />;
    }

    return (
        <Button
            disableElevation
            variant="contained"
            color="neutral"
            onClick={handleClick}
            title={`Send to ${plan.name}`}
            startIcon={<SendToPlanIcon />}
            sx={{
                maxWidth: "100%",
            }}
        >
            <SendToPlanWrapper>To {plan.name}</SendToPlanWrapper>
        </Button>
    );
};

export default SendToPlan;
