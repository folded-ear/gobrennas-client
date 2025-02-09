import useActiveShoppingPlanIds from "@/data/useActiveShoppingPlanIds";
import { includesBfsId } from "@/global/types/identity";
import { CheckboxOffIcon, CheckboxOnIcon } from "@/views/common/icons";
import React from "react";
import BasePlanNavItem, { BasePlanNavItemProps } from "./BasePlanNavItem";

export const NavShopItem: React.FC<BasePlanNavItemProps> = ({
    id,
    ...passthrough
}) => {
    const active = includesBfsId(useActiveShoppingPlanIds(), id);
    return (
        <BasePlanNavItem
            id={id}
            active={active}
            activeIcon={CheckboxOnIcon}
            inactiveIcon={CheckboxOffIcon}
            {...passthrough}
        />
    );
};
