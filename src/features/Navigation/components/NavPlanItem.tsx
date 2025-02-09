import React from "react";
import useActivePlanner from "@/data/useActivePlanner";
import BasePlanNavItem, { BasePlanNavItemProps } from "./BasePlanNavItem";
import { bfsIdEq } from "@/global/types/identity";

export const NavPlanItem: React.FC<BasePlanNavItemProps> = ({
    id,
    ...passthrough
}) => {
    const active = bfsIdEq(useActivePlanner().data?.id, id);
    return <BasePlanNavItem id={id} active={active} {...passthrough} />;
};
