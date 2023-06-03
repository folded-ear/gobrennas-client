import { ListItemButton } from "@mui/material";
import {
    NavLink,
    NavLinkProps
} from "react-router-dom";
import ListItemIcon from "@mui/material/ListItemIcon";
import * as React from "react";
import { ListItemButtonProps } from "@mui/material/ListItemButton/ListItemButton";

interface NavItemProps extends ListItemButtonProps<any, NavLinkProps> {
    icon: React.ReactNode
    title: string
}

export const NavItem: React.FC<NavItemProps> = (props) => {
    const { icon, title } = props;
    return (<ListItemButton
        component={NavLink}
        activeStyle={{
            fontWeight: "bold",
            color: "black"
        }}
        {...props}
    >
        <ListItemIcon>
            {icon}
        </ListItemIcon>
        {title}
    </ListItemButton>);
};
