import * as React from "react";
import useActivePlanner from "@/data/useActivePlanner";
import BasePlanNavItem, { BasePlanNavItemProps } from "./BasePlanNavItem";
import { ensureInt } from "@/global/utils";

export const NavPlanItem: React.FC<BasePlanNavItemProps> = ({
    id,
    ...passthrough
}) => {
    const active = useActivePlanner().data?.id === ensureInt(id);
    return <BasePlanNavItem id={id} active={active} {...passthrough} />;
};
