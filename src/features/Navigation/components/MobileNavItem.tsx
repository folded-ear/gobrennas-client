import { BottomNavigationAction } from "@mui/material";
import { ListItemButtonProps } from "@mui/material/ListItemButton/ListItemButton";
import * as React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

interface MobileNavItemProps
    extends ListItemButtonProps<NavLink, NavLinkProps> {
    icon: React.ReactNode;
    title: string;
}

export const MobileNavItem: React.FC<MobileNavItemProps> = (props) => {
    const { title } = props;
    return (
        <BottomNavigationAction component={NavLink} label={title} {...props} />
    );
};
