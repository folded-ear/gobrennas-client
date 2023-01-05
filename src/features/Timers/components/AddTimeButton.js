import React from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";
import { formatTimer } from "../../../util/time";

function AddTimeButton({
                           seconds,
                           onClick,
                       }) {
    return <Button
        variant={"text"}
        onClick={() => onClick(seconds)}
    >
        +{formatTimer(seconds)}
    </Button>;
}

AddTimeButton.propTypes = {
    seconds: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default AddTimeButton;
