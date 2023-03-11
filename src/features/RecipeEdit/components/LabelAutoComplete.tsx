import * as React from "react"
import Autocomplete from "@mui/lab/Autocomplete";
import { Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import { Label } from "../RecipeForm";

type LabelAutoCompleteProps = {
    labels: Label[],
    onLabelChange: (e, labels, reason) => void
}

export const LabelAutoComplete: React.FC<LabelAutoCompleteProps> = ({labels, onLabelChange}) => {

    const labelList = [
        { title: 'Benjamin' },
        { title: 'Desserts' },
        { title: 'Quick' },
    ];
    console.log(labels)

    return (
        <Stack spacing={3} sx={{ width: 500 }}>
            <Autocomplete
                multiple
                id="tags-standard"
                options={labelList}
                getOptionLabel={(option) => option.title}
                value={labels}
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
}