import {
    RadioButtonChecked as ActivePlanIcon,
    RadioButtonUnchecked as PlanIcon,
} from "@mui/icons-material";
import * as React from "react";
import { ListItemButton, Typography } from "@mui/material";
import useActivePlanner from "../../../data/useActivePlanner";
import { ItemIcon } from "./Navigation.elements";
import { BfsId } from "../../../global/types/types";

type NavPlanItemProps = {
    id: BfsId;
    onSelect: (e) => void;
    expanded: boolean;
    name: string;
    color: string;
};

export const NavPlanItem: React.FC<NavPlanItemProps> = ({
    onSelect,
    expanded,
    name,
    color,
    id,
}) => {
    const active = useActivePlanner().data?.id === id;
    const Icon = active ? ActivePlanIcon : PlanIcon;
    return (
        <ListItemButton onClick={() => onSelect(id)} title={name}>
            <ItemIcon open={expanded}>
                <Icon sx={{ color: color }} />
            </ItemIcon>
            <Typography noWrap>{expanded ? name : null}</Typography>
        </ListItemButton>
    );
};
