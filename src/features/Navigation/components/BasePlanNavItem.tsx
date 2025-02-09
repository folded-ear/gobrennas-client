import { BfsId } from "@/global/types/identity";
import { RadioOffIcon, RadioOnIcon } from "@/views/common/icons";
import { ListItemButton, Tooltip, Typography } from "@mui/material";
import { ItemIcon } from "./Navigation.elements";

export interface BasePlanNavItemProps {
    id: BfsId;
    onIconClick: (id: BfsId) => void;
    onClick: (id: BfsId) => void;
    expanded?: boolean;
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
