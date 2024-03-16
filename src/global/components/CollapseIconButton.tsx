import { ArrowRight } from "@mui/icons-material";
import PropTypes from "prop-types";
import React from "react";
import { IconButton, IconButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";

interface Props extends IconButtonProps {
    expanded: boolean;
    Icon?: typeof ArrowRight;
}

const TwistyIconButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
    transition: theme.transitions.duration.standard + "ms",
    "&.expanded": {
        transform: "rotate(90deg)",
    },
}));

const CollapseIconButton: React.FC<Props> = ({
    expanded,
    Icon = ArrowRight,
    ...props
}) => {
    return (
        <TwistyIconButton
            size="small"
            className={expanded ? "expanded" : ""}
            {...props}
        >
            <Icon />
        </TwistyIconButton>
    );
};

CollapseIconButton.propTypes = {
    expanded: PropTypes.bool.isRequired,
};

export default CollapseIconButton;
