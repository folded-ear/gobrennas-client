import useActivePlanner from "@/data/useActivePlanner";
import * as React from "react";
import BasePlanNavItem, { BasePlanNavItemProps } from "./BasePlanNavItem";

export const NavPlanItem: React.FC<BasePlanNavItemProps> = ({
    id,
    ...passthrough
}) => {
    const active = useActivePlanner().data?.id === id;
    return <BasePlanNavItem id={id} active={active} {...passthrough} />;
};
