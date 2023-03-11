import * as React from "react"
import Autocomplete from "@mui/lab/Autocomplete";
import { Stack } from "@mui/material";
import TextField from "@mui/material/TextField";

type LabelAutoCompleteProps = {
    onLabelChange: (e, labels, reason) => void
}

export const LabelAutoComplete: React.FC<LabelAutoCompleteProps> = ({onLabelChange}) => {

    const top100Films = [
        { title: 'The Shawshank Redemption', year: 1994 },
        { title: 'The Godfather', year: 1972 },
        { title: 'The Godfather: Part II', year: 1974 },
        { title: 'The Dark Knight', year: 2008 },
        { title: '12 Angry Men', year: 1957 },
        { title: "Schindler's List", year: 1993 },
        { title: 'Pulp Fiction', year: 1994 },
    ];
    return (
        <Stack spacing={3} sx={{ width: 500 }}>
            <Autocomplete
                multiple
                id="tags-standard"
                options={top100Films}
                getOptionLabel={(option) => option.title}
                defaultValue={[top100Films[0]]}
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