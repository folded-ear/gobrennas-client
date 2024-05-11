import * as React from "react";
import { Subheader } from "./Navigation.elements";

interface NavOwnerItemProps {
    name: string;
    expanded: boolean;
}

export const NavOwnerItem: React.FC<NavOwnerItemProps> = ({
    name,
    expanded,
}) => {
    return <Subheader title={name}>{name}</Subheader>;
};
