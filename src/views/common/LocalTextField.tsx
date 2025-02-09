import { TextField } from "@mui/material";
import { TextFieldProps } from "@mui/material/TextField/TextField";
import { Maybe } from "graphql/jsutils/Maybe";
import React from "react";

interface Props {
    value: Maybe<string>;
    onChange?: TextFieldProps["onChange"];
}

const LocalTextField: React.FC<Props & TextFieldProps> = ({
    value,
    onChange,
    ...props
}) => {
    const [localValue, setLocalValue] = React.useState(value || "");
    React.useEffect(() => setLocalValue(value || ""), [value]);
    return (
        <TextField
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={(e) => onChange && e.target.value !== value && onChange(e)}
            inputProps={{
                style: {
                    color: localValue ? "currentColor" : "#a3a3a3",
                },
            }}
            {...props}
        />
    );
};

export default LocalTextField;
