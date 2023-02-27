import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import React from "react";

const LocalTextField = ({
    value,
    onChange,
    ...props
}) => {
    const [
        localValue,
        setLocalValue,
    ] = React.useState(value || "");
    React.useEffect(() =>
        setLocalValue(value || ""),
        [value]);
    return <TextField
        value={localValue}
        onChange={e => setLocalValue(e.target.value)}
        onBlur={e => onChange && e.target.value !== value && onChange(e)}
        inputProps={{
            style: {
                color: localValue ? "currentColor" : "#a3a3a3",
            },
        }}
        {...props}
    />;
};

LocalTextField.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
};

export default LocalTextField;
