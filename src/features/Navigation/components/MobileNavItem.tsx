import * as React from "react";
import { BottomNavigationAction } from "@mui/material";
import { NavLink } from "react-router-dom";

export const MobileNavItem = (props) => {
    const {icon, title, value} = props;
    return (<BottomNavigationAction
        component={NavLink}
        label={title}
        value={value}
        icon={icon}
        {...props}
    />);
};