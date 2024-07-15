import { FlexBox } from "../../../global/components/FlexBox";
import React, { PropsWithChildren } from "react";
import { CSSObject, styled } from "@mui/material/styles";
import {
    Drawer,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { Subheader } from "../../Navigation/components/Navigation.elements";
import useFluxStore from "../../../data/useFluxStore";
import planStore, { PlanItem } from "../../Planner/data/planStore";
import LibraryStore from "../data/LibraryStore";
import { Recipe } from "../../../global/types/types";
import Divider from "@mui/material/Divider";
import PlanItemBucketChip from "../../Planner/components/PlanItemBucketChip";
import { mapBy } from "../../../util/groupBy";
import PlanItemStatus, {
    getColorForStatus,
} from "../../Planner/data/PlanItemStatus";
import DontChangeStatusButton from "../../Planner/components/DontChangeStatusButton";
import { DeleteIcon } from "../../../views/common/icons";
import Dispatcher from "../../../data/dispatcher";
import PlanActions from "../../Planner/data/PlanActions";

type Props = PropsWithChildren<unknown>;

export const drawerWidth = 150;

const openedMixin: CSSObject = {
    width: drawerWidth,
    overflowX: "hidden",
};

const Sidebar = styled(Drawer)(
    ({ theme }): CSSObject => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        ...openedMixin,
        "& .MuiDrawer-paper": openedMixin,
        "& li": {
            padding: `0 ${theme.spacing(1)}`,
        },
    }),
);

const BodyContainer: React.FC<Props> = () => {
    const plan = useFluxStore(() => {
        const { data: plan, loading } = planStore.getActivePlanRlo();
        if (!plan || loading) return null;
        const recipes: any[] = [];
        const bucketsById = mapBy(plan.buckets, (b) => b.id);
        const dfs = (it: PlanItem, depth: number) => {
            if (it.ingredientId) {
                const ing = LibraryStore.getIngredientRloById(it.ingredientId)
                    .data as Recipe;
                if (ing && ing.type === "Recipe") {
                    recipes.push({
                        ...it,
                        depth,
                        bucketId: it.bucketId,
                        bucket: it.bucketId
                            ? bucketsById.get(it.bucketId)
                            : undefined,
                        photo: ing.photo,
                    });
                }
            }
            for (const kid of planStore.getChildItemRlos(it.id)) {
                if (!kid.loading && kid.data) dfs(kid.data, depth + 1);
            }
        };
        dfs(plan, 0);

        return {
            id: plan.id,
            name: plan.name,
            buckets: plan.buckets,
            recipes,
        };
    }, [planStore, LibraryStore]);
    if (!plan) return null;

    return (
        <List dense>
            <Subheader>{plan.name}</Subheader>
            <Divider component="li" />
            {plan.recipes.map((item) => {
                const completing =
                    item._next_status === PlanItemStatus.COMPLETED;
                const deleting = item._next_status === PlanItemStatus.DELETED;
                return (
                    <ListItem key={item.id} alignItems={"flex-start"}>
                        <ListItemText
                            primary={item.name}
                            primaryTypographyProps={{
                                fontWeight: "bold",
                            }}
                            secondary={
                                <Grid
                                    container
                                    justifyContent={"space-between"}
                                    alignItems={"center"}
                                >
                                    <PlanItemBucketChip
                                        planId={plan.id}
                                        itemId={item.id}
                                        bucketId={item.bucketId}
                                        buckets={plan.buckets}
                                        offPlan={true}
                                    />
                                    {completing || deleting ? (
                                        <DontChangeStatusButton
                                            id={item.id}
                                            next={item._next_status}
                                        />
                                    ) : (
                                        <IconButton
                                            size={"small"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                Dispatcher.dispatch({
                                                    type: PlanActions.SET_STATUS,
                                                    id: item.id,
                                                    status: PlanItemStatus.DELETED,
                                                });
                                            }}
                                            color={"secondary"}
                                            sx={{
                                                p: 0,
                                                "&:hover": {
                                                    // this duplicates logic in coloredIconButton
                                                    color: getColorForStatus(
                                                        PlanItemStatus.DELETED,
                                                    )[500],
                                                },
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Grid>
                            }
                        />
                    </ListItem>
                );
            })}
        </List>
    );
};

export const CurrentPlanSidebar: React.FC<Props> = ({ children }: Props) => {
    return (
        <FlexBox>
            <div>{children}</div>
            <Sidebar variant="permanent" anchor={"right"}>
                <BodyContainer />
            </Sidebar>
        </FlexBox>
    );
};
