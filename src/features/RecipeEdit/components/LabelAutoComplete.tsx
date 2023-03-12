import * as React from "react";
import Autocomplete from "@mui/lab/Autocomplete";
import { Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import { Label } from "../RecipeForm";

type LabelAutoCompleteProps = {
    recipeLabels: Label[],
    labelList: Label[],
    onLabelChange: (e, labels, reason) => void
}

export const LabelAutoComplete: React.FC<LabelAutoCompleteProps> = ({
        recipeLabels,
        labelList,
        onLabelChange
    }) => (
        <Stack spacing={3} sx={{width: 500}}>
            <Autocomplete
                multiple
                id="tags-standard"
                options={labelList}
                getOptionLabel={(option) => option.name}
                value={recipeLabels}
                onChange={onLabelChange}
                renderInput={(params) => {
                    return (
                        <TextField
                            {...params}
                            variant="standard"
                            label="Recipe Labels"
                            placeholder="..."
                        />
                    );
                }}
            />
        </Stack>);