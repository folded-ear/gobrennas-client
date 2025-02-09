import { DropDownIcon } from "@/views/common/icons";
import React from "react";
import { IconButton, IconButtonProps } from "@mui/material";
import { styled } from "@mui/material/styles";

interface Props extends IconButtonProps {
    expanded?: boolean;
    Icon?: typeof DropDownIcon;
}

const TwistyIconButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
    // since these twist, they should be round
    borderRadius: "50%",
    transform: "rotate(-90deg)",
    transition: theme.transitions.duration.standard + "ms",
    "&.expanded": {
        transform: "rotate(0)",
    },
}));

const CollapseIconButton: React.FC<Props> = ({
    expanded,
    Icon = DropDownIcon,
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

export default CollapseIconButton;
