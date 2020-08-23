import { Chip } from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";

const LabelItem = ({label}) => {
    return <Chip size="small" label={label} />;
};

LabelItem.propTypes = {
    label: PropTypes.string
};

export default LabelItem;
