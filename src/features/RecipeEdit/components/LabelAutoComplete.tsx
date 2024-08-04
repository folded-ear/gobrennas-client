import * as React from "react";
import { Stack } from "@mui/material";
import { ChipPicker } from "@/global/components/ChipPicker";

interface LabelAutoCompleteProps {
    recipeLabels: string[];
    labelList: string[];

    onLabelChange(e, labels: string[], reason): void;
}

export const LabelAutoComplete: React.FC<LabelAutoCompleteProps> = ({
    recipeLabels,
    labelList,
    onLabelChange,
}) => (
    <Stack spacing={3} sx={{ width: 500 }}>
        <ChipPicker
            value={recipeLabels}
            options={labelList}
            fieldLabel={"Recipe Labels"}
            onChange={onLabelChange}
        />
    </Stack>
);
