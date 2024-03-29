import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import { formatTimer } from "../../../util/time";

function AddTimeButton({ seconds, onClick }) {
    const text = formatTimer(seconds);
    return (
        <Button
            variant={"text"}
            onClick={() => onClick(seconds)}
            title={`Add ${text} to timer`}
        >
            +{text}
        </Button>
    );
}

AddTimeButton.propTypes = {
    seconds: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default AddTimeButton;
