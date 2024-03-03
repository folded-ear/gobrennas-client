import {
    CheckBoxOutlineBlankOutlined as InactiveIcon,
    CheckBoxOutlined as ActiveIcon,
} from "@mui/icons-material";
import * as React from "react";
import useActiveShoppingPlanIds from "../../../data/useActiveShoppingPlanIds";
import BasePlanNavItem, { BasePlanNavItemProps } from "./BasePlanNavItem";

export const NavShopItem: React.FC<BasePlanNavItemProps> = ({
    id,
    ...passthrough
}) => {
    const active = useActiveShoppingPlanIds().includes(id);
    return (
        <BasePlanNavItem
            id={id}
            active={active}
            activeIcon={ActiveIcon}
            inactiveIcon={InactiveIcon}
            {...passthrough}
        />
    );
};
