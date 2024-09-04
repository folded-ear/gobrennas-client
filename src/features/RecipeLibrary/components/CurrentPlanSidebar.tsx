import React, { ReactElement } from "react";
import { CSSObject, styled } from "@mui/material/styles";
import {
    alpha,
    Box,
    Drawer,
    List,
    ListItemText,
    ListSubheader,
    Typography,
} from "@mui/material";
import useFluxStore from "@/data/useFluxStore";
import planStore, {
    Plan as TPlan,
    PlanBucket,
    PlanItem,
} from "@/features/Planner/data/planStore";
import LibraryStore from "../data/LibraryStore";
import { Recipe } from "@/global/types/types";
import groupBy, { mapBy } from "@/util/groupBy";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import DontChangeStatusButton from "@/features/Planner/components/DontChangeStatusButton";
import { Maybe } from "graphql/jsutils/Maybe";
import DragContainer from "@/features/Planner/components/DragContainer";
import Item from "@/features/Planner/components/Item";
import getBucketLabel from "@/features/Planner/components/getBucketLabel";
import StatusIconButton from "@/features/Planner/components/StatusIconButton";
import { assignItemToBucket } from "@/features/Planner/components/PlanItemBucketChip";
import withStyles from "@mui/styles/withStyles";
import { moveSubtree } from "@/features/Planner/components/Plan";
import ResetBucketsButton from "@/features/Planner/components/ResetBucketsButton";
import useWhileOver from "@/util/useWhileOver";
import CookButton from "@/features/Planner/components/CookButton";
import { BfsId } from "@/global/types/identity";
import {
    isDoNotRecognize,
    isSection,
} from "@/features/Planner/data/plannerUtils";

const drawerWidth = 220;
const BUCKET_PREFIX = "bucket-";

const openedMixin: CSSObject = {
    width: drawerWidth,
    overflowX: "hidden",
};

const Sidebar = styled(Drawer)({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...openedMixin,
    "& .MuiDrawer-paper": openedMixin,
});

const Header = styled(ListSubheader)(({ theme }) => ({
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: theme.typography.h5.fontSize,
    paddingLeft: theme.spacing(1),
}));

const DndItem = withStyles(() => ({
    root: {
        borderBottomWidth: 0,
        "& .MuiListItemIcon-root": {
            minWidth: 0,
        },
    },
}))(Item);

type RecipeInfo = PlanItem & {
    depth: number;
    bucket?: Maybe<PlanBucket>;
    photo?: Recipe["photo"];
} & (
        | { canCook: false }
        | {
              canCook: true;
              planId: BfsId;
          }
    );

type PlanInfo = Pick<TPlan, "id" | "name" | "buckets"> & {
    recipes: RecipeInfo[];
};

const BodyContainer: React.FC = () => {
    const plan = useFluxStore<Maybe<PlanInfo>>(() => {
        const { data: plan, loading } = planStore.getActivePlanRlo();
        if (!plan || loading) return;
        const recipes: RecipeInfo[] = [];
        const dfs = (it: PlanItem, depth: number) => {
            if (it.ingredientId) {
                const ing = LibraryStore.getIngredientRloById(it.ingredientId)
                    .data as Recipe;
                if (ing && ing.type === "Recipe") {
                    recipes.push({
                        ...it,
                        canCook: true,
                        planId: plan.id,
                        depth,
                        photo: ing.photo,
                    });
                }
            } else if (depth === 1 && it.name !== "") {
                // top-level, non-recipe item
                recipes.push({
                    ...it,
                    canCook: !!it.subtaskIds?.length,
                    planId: plan.id,
                    depth,
                });
            }
            for (const kid of planStore.getChildItemRlos(it.id)) {
                if (!kid.loading && kid.data) dfs(kid.data, depth + 1);
            }
        };
        dfs(plan, 0);

        if (plan.buckets) {
            const bucketsById = mapBy(plan.buckets, (b) => b.id);
            recipes.forEach(
                (it) =>
                    (it.bucket = it.bucketId
                        ? bucketsById.get(it.bucketId)
                        : undefined),
            );
        }

        return {
            id: plan.id,
            name: plan.name,
            buckets: plan.buckets,
            recipes,
        };
    }, [planStore, LibraryStore]);

    if (!plan) return null;

    const renderItem = (item: RecipeInfo) => {
        return <PlannedRecipe key={item.id} item={item} />;
    };

    const children: ReactElement[] = [];
    if (plan.buckets.length === 0) {
        if (plan.recipes.length > 0) {
            plan.recipes.forEach((item) => children.push(renderItem(item)));
        }
    } else {
        const byBucket = groupBy(plan.recipes, (item) => item.bucketId);
        plan.buckets.forEach((b) => {
            children.push(<Bucket key={b.id} bucket={b} />);
            const rs = byBucket.get(b.id);
            if (rs) rs.forEach((item) => children.push(renderItem(item)));
        });
        children.push(<Bucket key={"none"} />);
        const rs = byBucket.get(undefined);
        if (rs) rs.forEach((item) => children.push(renderItem(item)));
    }

    return (
        <DragContainer
            renderOverlay={(id) => {
                const it = plan.recipes.find((it) => it.id === id);
                return it && renderItem(it);
            }}
            onDrop={(activeId, targetId, vertical) => {
                const act = plan.recipes.find((r) => r.id === activeId);
                if (!act) return;
                let target: Maybe<RecipeInfo>;
                let targetBucket: Maybe<PlanBucket>;
                if (
                    typeof targetId === "number" ||
                    !targetId.startsWith(BUCKET_PREFIX)
                ) {
                    target = plan.recipes.find((r) => r.id === targetId);
                    targetBucket = target?.bucket;
                } else {
                    const bucketId = targetId.substring(BUCKET_PREFIX.length);
                    // triple equals won't equate 123 and "123", but BfsId allows either
                    // eslint-disable-next-line eqeqeq
                    targetBucket = plan?.buckets.find((b) => b.id == bucketId);
                }
                // triple equals doesn't equate null and undefined, but Maybe allows either
                // eslint-disable-next-line eqeqeq
                if (act.bucket != targetBucket) {
                    assignItemToBucket(act.id, targetBucket?.id);
                }
                if (target) {
                    moveSubtree(activeId, target, "none", vertical);
                }
            }}
        >
            <List dense>
                <Plan plan={plan} />
                {children}
            </List>
        </DragContainer>
    );
};

const Subheader = withStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(1),
        color: theme.palette.text.neutral,
        borderTop: `1px solid ${theme.palette.divider}`,
    },
}))(DndItem);

const Bucket = ({ bucket }: { bucket?: PlanBucket }) => {
    return (
        <Subheader dragId={BUCKET_PREFIX + (bucket ? bucket.id : -1)} noDrag>
            <ListItemText primary={bucket ? getBucketLabel(bucket) : "Other"} />
        </Subheader>
    );
};

interface PlanProps {
    plan: PlanInfo;
}

const Plan: React.FC<PlanProps> = ({ plan }) => {
    const { over, sensorProps } = useWhileOver();
    return (
        <>
            <Typography variant="h6" sx={{ paddingLeft: "8px" }}>
                {plan.name}
            </Typography>
            <Header sx={{ position: "relative" }} {...sensorProps}>
                <ResetBucketsButton
                    planId={plan.id}
                    sx={{
                        display: over ? "block" : "none",
                        position: "absolute",
                        right: 0,
                        top: 7,
                    }}
                />
            </Header>
        </>
    );
};

interface PlannedRecipeProps {
    item: RecipeInfo;
}

const PlannedRecipe: React.FC<PlannedRecipeProps> = ({ item }) => {
    const { over: buttonVisible, sensorProps } = useWhileOver();
    const goingAway =
        item._next_status === PlanItemStatus.COMPLETED ||
        item._next_status === PlanItemStatus.DELETED;
    return (
        <DndItem key={item.id} dragId={item.id} position={"relative"}>
            <ListItemText disableTypography {...sensorProps}>
                <Typography
                    component={goingAway ? "del" : "div"}
                    variant={"body2"}
                    fontWeight={"bold"}
                >
                    {isDoNotRecognize(item)
                        ? item.name.substring(1)
                        : isSection(item)
                        ? item.name.substring(0, item.name.length - 1)
                        : item.name}
                    <Box
                        component={"span"}
                        sx={(theme) => ({
                            position: "absolute",
                            right: 0,
                            top: 0,
                            backgroundColor: alpha(
                                theme.palette.background.paper,
                                0.7,
                            ),
                            display:
                                buttonVisible || goingAway ? "block" : "none",
                        })}
                    >
                        {buttonVisible && !goingAway && item.canCook && (
                            <CookButton
                                key="cook"
                                size="small"
                                planId={item.planId}
                                itemId={item.id}
                            />
                        )}
                        {goingAway ? (
                            <DontChangeStatusButton
                                id={item.id}
                                next={
                                    item._next_status! /* eslint-disable-line @typescript-eslint/no-non-null-assertion */
                                }
                            />
                        ) : (
                            <StatusIconButton
                                key="delete"
                                id={item.id}
                                next={PlanItemStatus.DELETED}
                            />
                        )}
                    </Box>
                </Typography>
            </ListItemText>
        </DndItem>
    );
};

export const CurrentPlanSidebar: React.FC = () => {
    return (
        <Sidebar variant="permanent" anchor={"right"}>
            <BodyContainer />
        </Sidebar>
    );
};
