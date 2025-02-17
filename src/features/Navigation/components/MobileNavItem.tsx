import {
    BottomNavigationAction,
    BottomNavigationActionProps,
} from "@mui/material";
import * as React from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

interface MobileNavItemProps
    extends BottomNavigationActionProps<NavLink, NavLinkProps> {
    icon: React.ReactNode;
    title: string;
}

export const MobileNavItem: React.FC<MobileNavItemProps> = (props) => {
    const { title } = props;
    return (
        <BottomNavigationAction component={NavLink} label={title} {...props} />
    );
};
