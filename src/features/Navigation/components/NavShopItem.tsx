import {
    CheckBoxOutlineBlankOutlined as ShopIcon,
    CheckBoxOutlined as ActiveShopIcon,
} from "@mui/icons-material";
import * as React from "react";
import { ListItemButton, Typography } from "@mui/material";
import { ItemIcon } from "./Navigation.elements";
import { BfsId } from "../../../global/types/types";
import useActiveShoppingPlanIds from "../../../data/useActiveShoppingPlanIds";

type NavShopItemProps = {
    id: BfsId;
    onSelect: (e) => void;
    expanded: boolean;
    name: string;
    color: string;
};

export const NavShopItem: React.FC<NavShopItemProps> = ({
    onSelect,
    expanded,
    name,
    color,
    id,
}) => {
    const active = useActiveShoppingPlanIds().includes(id);
    const Icon = active ? ActiveShopIcon : ShopIcon;
    return (
        <ListItemButton onClick={() => onSelect(id)} title={name}>
            <ItemIcon open={expanded}>
                <Icon sx={{ color: color }} />
            </ItemIcon>
            <Typography noWrap>{expanded ? name : null}</Typography>
        </ListItemButton>
    );
};
