import { TripOrigin as PlanIcon } from "@mui/icons-material";
import * as React from "react";
import {
    ListItemButton,
    ListItemIcon,
    Typography
} from "@mui/material";

type NavPlanItemProps = {
    id: string | number,
    onSelect: (e) => void,
    expanded: boolean,
    name: string,
    color: string,
}

export const NavPlanItem: React.FC<NavPlanItemProps> = ({onSelect, expanded, name, color, id}) => {
    return (<ListItemButton onClick={() => onSelect(id)} key={id}>
        <ListItemIcon>
            <PlanIcon sx={{color: color}}/>
        </ListItemIcon>
        <Typography noWrap>
            {expanded ? name : null}
        </Typography>
    </ListItemButton>);
};
