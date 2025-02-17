import useActivePlanner from "@/data/useActivePlanner";
import { bfsIdEq } from "@/global/types/identity";
import * as React from "react";
import BasePlanNavItem, { BasePlanNavItemProps } from "./BasePlanNavItem";

export const NavPlanItem: React.FC<BasePlanNavItemProps> = ({
    id,
    ...passthrough
}) => {
    const active = bfsIdEq(useActivePlanner().data?.id, id);
    return <BasePlanNavItem id={id} active={active} {...passthrough} />;
};
