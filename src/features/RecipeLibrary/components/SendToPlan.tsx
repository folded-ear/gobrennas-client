import { IconButton } from "@mui/material";
import { SendToPlanIcon } from "@/views/common/icons";
import React from "react";
import useActivePlanner from "@/data/useActivePlanner";
import SplitButton, { SelectOption } from "@/views/common/SplitButton";
import { useScaleOptions } from "@/util/ScalingContext";
import TextButton from "@/views/common/TextButton";
import { TaskBarButton } from "@/global/elements/toolbar.elements";

interface Props {
    onClick(planId: number, scale?: number | null): void;
    iconOnly?: boolean;
    showScaleOptions?: boolean;
}

const SendToPlan: React.FC<Props> = ({
    onClick,
    iconOnly,
    showScaleOptions = false,
}) => {
    const list = useActivePlanner().data;
    const scaleOpts = useScaleOptions();

    const scaleToPlanOpts = scaleOpts.map((it, idx) => ({
        id: idx,
        label: it.label,
        value: it.value,
    }));

    if (!list) return null;
    const handleClick = () =>
        // While items can exist in the store in an unsaved state, plans
        // cannot, so this type assertion is safe.
        onClick && onClick(list.id as number);

    const handleSelect = (_, selected: SelectOption<number>) => {
        onClick && onClick(list.id as number, selected?.value);
    };

    if (iconOnly) {
        return (
            <TaskBarButton
                onClick={handleClick}
                title={`Send to "${list.name}"`}
            >
                <SendToPlanIcon />
            </TaskBarButton>
        );
    }

    if (showScaleOptions) {
        return (
            <SplitButton
                disableElevation
                primary={`To ${list.name}`}
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
        <TextButton
            disableElevation
            variant="contained"
            color="neutral"
            onClick={handleClick}
            title={`Send to ${list.name}`}
            startIcon={<SendToPlanIcon />}
            sx={{ maxWidth: "100%" }}
        >
            To {list.name}
        </TextButton>
    );
};

export default SendToPlan;
