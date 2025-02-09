import Autocomplete, { AutocompleteProps } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import React from "react";

interface Props
    extends Omit<
        AutocompleteProps<string, true, boolean, true>,
        "multiple" | "freeSolo" | "renderInput"
    > {
    fieldLabel?: string;
    fieldPlaceholder?: string;
    inputRef?: React.Ref<HTMLInputElement>;
}

export const ChipPicker = ({
    fieldLabel,
    fieldPlaceholder = "Add Label",
    inputRef,
    ...passthrough
}: Props) => {
    return (
        <Autocomplete
            {...passthrough}
            multiple
            freeSolo
            onKeyDown={(e) => {
                if (e.key === "Enter") e.stopPropagation();
            }}
            renderInput={(params) => {
                return (
                    <TextField
                        {...params}
                        inputRef={inputRef}
                        variant="standard"
                        label={fieldLabel}
                        placeholder={fieldPlaceholder}
                    />
                );
            }}
        />
    );
};
