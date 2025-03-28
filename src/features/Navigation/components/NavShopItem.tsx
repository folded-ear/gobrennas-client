import useActiveShoppingPlanIds from "@/data/useActiveShoppingPlanIds";
import { CheckboxOffIcon, CheckboxOnIcon } from "@/views/common/icons";
import * as React from "react";
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
            activeIcon={CheckboxOnIcon}
            inactiveIcon={CheckboxOffIcon}
            {...passthrough}
        />
    );
};
