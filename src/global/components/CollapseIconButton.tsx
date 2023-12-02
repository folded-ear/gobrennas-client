import { ArrowDropDown, ArrowRight } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import PropTypes from "prop-types";
import React from "react";
import { IconButtonProps } from "@mui/material";

interface Props extends IconButtonProps {
    expanded: boolean;
}

const CollapseIconButton: React.FC<Props> = ({ expanded, ...props }) => {
    const Icn = expanded ? ArrowDropDown : ArrowRight;
    return (
        <IconButton size="small" {...props}>
            <Icn />
        </IconButton>
    );
};

CollapseIconButton.propTypes = {
    expanded: PropTypes.bool.isRequired,
};

export default CollapseIconButton;
