import { ListItemButton } from "@mui/material";
import {
  NavLink,
  NavLinkProps
} from "react-router-dom";
import * as React from "react";
import { ListItemButtonProps } from "@mui/material/ListItemButton/ListItemButton";
import { ItemIcon } from "./Navigation.elements";

interface NavItemProps extends ListItemButtonProps<any, NavLinkProps> {
    expanded: boolean;
    icon: React.ReactNode;
    title: string;
}

export const NavItem: React.FC<NavItemProps> = ({
    expanded,
    ...passthrough
}) => {
    const { icon, title } = passthrough;
    return (
        <ListItemButton component={NavLink} {...passthrough}>
            <ItemIcon open={expanded}>{icon}</ItemIcon>
            {expanded ? title : null}
        </ListItemButton>
    );
};
