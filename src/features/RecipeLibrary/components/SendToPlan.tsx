import useActivePlanner from "@/data/useActivePlanner";
import { TaskBarButton } from "@/global/elements/taskbar.elements";
import { BfsId } from "@/global/types/identity";
import { useScaleOptions } from "@/util/ScalingContext";
import { SendToPlanIcon } from "@/views/common/icons";
import SplitButton, { SelectOption } from "@/views/common/SplitButton";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import * as React from "react";

interface Props {
    onClick(planId: BfsId, scale?: number | null): void;
    iconOnly?: boolean;
    showScaleOptions?: boolean;
}

const SendToPlanWrapper = styled("div")({
    width: "100%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
});

const SendToPlan: React.FC<Props> = ({
    onClick,
    iconOnly,
    showScaleOptions = false,
}) => {
    const plan = useActivePlanner().data;
    const scaleOpts = useScaleOptions();

    const scaleToPlanOpts = scaleOpts.map((it) => ({
        id: it.label,
        label: it.label,
        value: it.value,
    }));

    if (!plan) return null;
    const handleClick = () =>
        // While items can exist in the store in an unsaved state, plans
        // cannot, so this type assertion is safe.
        onClick && onClick(plan.id);

    const handleSelect = (_: never, selected: SelectOption<number>) => {
        onClick && onClick(plan.id, selected?.value);
    };

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
