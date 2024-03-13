import useAllPlansRLO from "../../data/useAllPlansRLO";
import { Box, Collapse, List } from "@mui/material";
import * as React from "react";
import { NavOwnerItem } from "../../features/Planner/components/PlanHeader";
import { NavShopItem } from "../../features/Navigation/components/NavShopItem";
import { colorHash } from "../../constants/colors";
import Divider from "@mui/material/Divider";
import { toggleShoppingPlan } from "../../features/Navigation/NavigationController";

interface Props {
    open?: boolean;
}

export default function MobileShoppingPlanSelector({ open = false }: Props) {
    const allPlans = useAllPlansRLO().data;
    if (!allPlans || allPlans.length < 2) return null;
    return (
        <Collapse in={open}>
            <Box mt={1}>
                <Divider />
                <List>
                    {allPlans.map((item, i) => {
                        const elements = [
                            <NavShopItem
                                key={item.id}
                                onIconClick={toggleShoppingPlan}
                                onClick={toggleShoppingPlan}
                                id={item.id}
                                expanded
                                name={item.name}
                                color={colorHash(item.id)}
                            />,
                        ];
                        if (
                            i > 0 &&
                            item.acl.ownerId !== allPlans[i - 1].acl.ownerId
                        ) {
                            elements.unshift(
                                <NavOwnerItem
                                    key={-item.id}
                                    id={item.acl.ownerId}
                                />,
                            );
                        }
                        return elements;
                    })}
                </List>
                <Divider />
            </Box>
        </Collapse>
    );
}
