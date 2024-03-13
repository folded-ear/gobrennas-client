import useAllPlansRLO from "../../data/useAllPlansRLO";
import { Box, Collapse, List, ListSubheader } from "@mui/material";
import * as React from "react";
import { NavShopItem } from "../../features/Navigation/components/NavShopItem";
import { colorHash } from "../../constants/colors";
import Divider from "@mui/material/Divider";
import useFriendLO from "../../data/useFriendLO";
import { BfsId } from "../../global/types/types";
import { ripLoadObject } from "../../util/ripLoadObject";

function OwnerSubheader({ id }: { id: BfsId }) {
    const { data: user } = ripLoadObject(useFriendLO(id));
    return (
        <ListSubheader title={`${user?.name} (${id})`}>
            {user?.name || "…"}
        </ListSubheader>
    );
}

interface Props {
    open?: boolean;
    PlanItem: typeof NavShopItem;
    onSelectPlan: (id: BfsId) => void;
}

export default function MobilePlanSelector({
    open = false,
    PlanItem,
    onSelectPlan,
}: Props) {
    const allPlans = useAllPlansRLO().data;
    if (!allPlans || allPlans.length < 2) return null;
    return (
        <Collapse in={open}>
            <Box mt={1}>
                <Divider />
                <List
                    disablePadding
                    sx={{ maxHeight: "30vh", overflow: "auto" }}
                >
                    {allPlans.map((item, i) => {
                        const elements = [
                            <PlanItem
                                key={item.id}
                                onIconClick={onSelectPlan}
                                onClick={onSelectPlan}
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
                                <OwnerSubheader
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
