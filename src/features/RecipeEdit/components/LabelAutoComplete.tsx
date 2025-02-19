import { ChipPicker } from "@/global/components/ChipPicker";
import { Stack } from "@mui/material";
import { AutocompleteChangeReason } from "@mui/material/useAutocomplete/useAutocomplete";
import * as React from "react";

export interface LabelAutoCompleteProps {
    recipeLabels?: string[];
    labelList: string[];

    onLabelChange(
        e: React.SyntheticEvent,
        labels: string[],
        reason: AutocompleteChangeReason,
    ): void;
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
