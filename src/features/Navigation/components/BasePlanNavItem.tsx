import { RadioOffIcon, RadioOnIcon } from "views/common/icons";
import { ListItemButton, Tooltip, Typography } from "@mui/material";
import { ItemIcon } from "./Navigation.elements";
import * as React from "react";
import { BfsId } from "global/types/identity";

export interface BasePlanNavItemProps {
    id: BfsId;
    onIconClick: (e) => void;
    onClick: (e) => void;
    expanded: boolean;
    name: string;
    color: string;
}
interface Props extends BasePlanNavItemProps {
    active: boolean;
    activeIcon?: typeof RadioOnIcon;
    inactiveIcon?: typeof RadioOffIcon;
}

export default function BasePlanNavItem({
    // core stuff
    onClick,
    onIconClick,
    expanded,
    name,
    color,
    id,
    // abstract stuff
    active,
    activeIcon = RadioOnIcon,
    inactiveIcon = RadioOffIcon,
}: Props) {
    const Icon = active ? activeIcon : inactiveIcon;
    return (
        <ListItemButton onClick={() => onClick(id)}>
            <ItemIcon
                onClick={(e) => {
                    e.stopPropagation();
                    onIconClick(id);
                }}
                open={expanded}
            >
                <Tooltip title={name} placement={"right"} arrow>
                    <Icon sx={{ color: color }} />
                </Tooltip>
            </ItemIcon>
            <Typography noWrap title={name}>
                {expanded ? name : null}
            </Typography>
        </ListItemButton>
    );
}
