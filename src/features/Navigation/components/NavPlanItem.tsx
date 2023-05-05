import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Circle as CircleIcon } from "@mui/icons-material";
import * as React from "react";

export const NavPlanItem = ({name, color}) => {
    return (<ListItem>
        <ListItemIcon>
            <CircleIcon sx={{ fontSize: 10, color: color }} />
        </ListItemIcon>
        {name}
    </ListItem>)
}
