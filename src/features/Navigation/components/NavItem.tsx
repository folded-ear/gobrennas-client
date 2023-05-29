import { ListItemButton } from "@mui/material";
import { NavLink } from "react-router-dom";
import ListItemIcon from "@mui/material/ListItemIcon";
import * as React from "react";

export const NavItem = (props) => {
    const {icon, title} = props;
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
}