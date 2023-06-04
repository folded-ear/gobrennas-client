import {
    RadioButtonChecked as ActivePlanIcon,
    RadioButtonUnchecked as PlanIcon,
} from "@mui/icons-material";
import * as React from "react";
import {
    ListItemButton,
    ListItemIcon,
    Typography
} from "@mui/material";
import useActivePlanner from "../../../data/useActivePlanner";

type NavPlanItemProps = {
    id: string | number,
    onSelect: (e) => void,
    expanded: boolean,
    name: string,
    color: string,
}

export const NavPlanItem: React.FC<NavPlanItemProps> = ({onSelect, expanded, name, color, id}) => {
    const active = useActivePlanner().data?.id === id;
    const Icon = active
        ? ActivePlanIcon
        : PlanIcon;
    return (<ListItemButton onClick={() => onSelect(id)} title={name}>
        <ListItemIcon>
            <Icon sx={{ color: color }} />
        </ListItemIcon>
        <Typography noWrap>
            {expanded ? name : null}
        </Typography>
    </ListItemButton>);
};
