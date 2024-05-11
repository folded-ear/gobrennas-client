import { CheckboxOffIcon, CheckboxOnIcon } from "views/common/icons";
import * as React from "react";
import useActiveShoppingPlanIds from "../../../data/useActiveShoppingPlanIds";
import BasePlanNavItem, { BasePlanNavItemProps } from "./BasePlanNavItem";
import { ensureInt } from "global/utils";

export const NavShopItem: React.FC<BasePlanNavItemProps> = ({
    id,
    ...passthrough
}) => {
    const active = useActiveShoppingPlanIds().includes(ensureInt(id));
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
