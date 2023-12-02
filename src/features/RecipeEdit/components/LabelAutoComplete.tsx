import * as React from "react";
import Autocomplete from "@mui/lab/Autocomplete";
import { Stack } from "@mui/material";
import TextField from "@mui/material/TextField";

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
        <Autocomplete
            multiple
            freeSolo
            id="tags-standard"
            options={labelList}
            value={recipeLabels}
            onChange={onLabelChange}
            renderInput={(params) => {
                return (
                    <TextField
                        {...params}
                        variant="standard"
                        label="Recipe Labels"
                        placeholder="Add Label"
                    />
                );
            }}
        />
    </Stack>
);
