import useAllPlansRLO from "@/data/useAllPlansRLO";
import useFriendRlo from "@/data/useFriendRlo";
import { NavShopItem } from "@/features/Navigation/components/NavShopItem";
import { BfsId, bfsIdEq } from "@/global/types/identity";
import { Box, Collapse, List, ListSubheader } from "@mui/material";
import Divider from "@mui/material/Divider";

function OwnerSubheader({ id }: { id: BfsId }) {
    const { data: user } = useFriendRlo(id);
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
                    sx={{
                        maxHeight: "30vh",
                        overflow: "auto",
                        "> div": {
                            // this is sorta silly
                            paddingLeft: 1,
                        },
                    }}
                >
                    {allPlans.map((plan, i) => {
                        const elements = [
                            <PlanItem
                                key={plan.id}
                                onIconClick={onSelectPlan}
                                onClick={onSelectPlan}
                                id={plan.id}
                                expanded
                                name={plan.name}
                                color={plan.color}
                            />,
                        ];
                        if (
                            i > 0 &&
                            !bfsIdEq(
                                plan.acl.ownerId,
                                allPlans[i - 1].acl.ownerId,
                            )
                        ) {
                            elements.unshift(
                                <OwnerSubheader
                                    key={-plan.id}
                                    id={plan.acl.ownerId}
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
