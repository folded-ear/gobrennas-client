import { FlexBox } from "../../../global/components/FlexBox";
import React, { PropsWithChildren } from "react";
import { CSSObject, styled } from "@mui/material/styles";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { Subheader } from "../../Navigation/components/Navigation.elements";
import useFluxStore from "../../../data/useFluxStore";
import planStore, { PlanItem } from "../../Planner/data/planStore";
import { mapBy } from "../../../util/groupBy";
import LibraryStore from "../data/LibraryStore";
import { Recipe } from "../../../global/types/types";
import getBucketLabel from "../../Planner/components/getBucketLabel";
import Divider from "@mui/material/Divider";

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
    const summary = useFluxStore(() => {
        const { data: plan, loading } = planStore.getActivePlanRlo();
        if (!plan || loading) return null;
        const recipes: any[] = [];
        const bucketsById = mapBy(plan.buckets, (b) => b.id);
        const dfs = (it: PlanItem, depth: number) => {
            if (it.ingredientId) {
                const ing = LibraryStore.getIngredientRloById(it.ingredientId)
                    .data as Recipe;
                if (ing && ing.type === "Recipe") {
                    const bucket = it.bucketId
                        ? bucketsById.get(it.bucketId)
                        : undefined;
                    recipes.push({
                        id: it.id,
                        name: it.name,
                        depth,
                        bucketId: it.bucketId,
                        bucket: bucket && getBucketLabel(bucket),
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
            name: plan.name,
            recipes,
        };
    }, [planStore, LibraryStore]);
    if (!summary) return null;

    return (
        <List>
            <Subheader>{summary.name}</Subheader>
            <Divider component="li" />
            {summary.recipes.map((r) => (
                <ListItem key={r.id} alignItems={"flex-start"}>
                    <ListItemText primary={r.name} secondary={r.bucket} />
                </ListItem>
            ))}
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
