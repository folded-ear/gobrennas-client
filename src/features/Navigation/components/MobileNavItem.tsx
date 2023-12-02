import * as React from "react";
import { BottomNavigationAction } from "@mui/material";
import { NavLink, NavLinkProps } from "react-router-dom";
import { ListItemButtonProps } from "@mui/material/ListItemButton/ListItemButton";

interface MobileNavItemProps extends ListItemButtonProps<any, NavLinkProps> {
    icon: React.ReactNode;
    title: string;
}

export const MobileNavItem: React.FC<MobileNavItemProps> = (props) => {
    const { title } = props;
    return (
        <BottomNavigationAction component={NavLink} label={title} {...props} />
    );
};
