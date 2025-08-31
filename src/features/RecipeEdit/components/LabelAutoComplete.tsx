import { ChipPicker } from "@/global/components/ChipPicker";
import { AutocompleteProps } from "@mui/material/Autocomplete";
import { AutocompleteChangeReason } from "@mui/material/useAutocomplete/useAutocomplete";
import * as React from "react";

export interface LabelAutoCompleteProps {
    recipeLabels?: string[];
    labelList: string[];
    fieldLabel?: string;
    size?: AutocompleteProps<string, true, boolean, true>["size"];

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
    fieldLabel = "Labels",
    size,
}) => (
    <ChipPicker
        value={recipeLabels}
        options={labelList}
        fieldLabel={fieldLabel}
        onChange={onLabelChange}
        size={size}
        fullWidth
    />
);
