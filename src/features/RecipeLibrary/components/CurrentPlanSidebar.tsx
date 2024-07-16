import { FlexBox } from "../../../global/components/FlexBox";
import React, { PropsWithChildren, useState } from "react";
import { CSSObject, styled } from "@mui/material/styles";
import {
    Drawer,
    List,
    ListItemText,
    ListSubheader,
    Typography,
} from "@mui/material";
import useFluxStore from "../../../data/useFluxStore";
import planStore, { PlanBucket, PlanItem } from "../../Planner/data/planStore";
import LibraryStore from "../data/LibraryStore";
import { Recipe } from "../../../global/types/types";
import { mapBy } from "../../../util/groupBy";
import PlanItemStatus from "../../Planner/data/PlanItemStatus";
import DontChangeStatusButton from "../../Planner/components/DontChangeStatusButton";
import { Maybe } from "graphql/jsutils/Maybe";
import { bucketComparator } from "../../../util/comparators";
import DragContainer from "../../Planner/components/DragContainer";
import Item from "../../Planner/components/Item";
import getBucketLabel from "../../Planner/components/getBucketLabel";
import StatusIconButton from "../../Planner/components/StatusIconButton";
import { assignItemToBucket } from "../../Planner/components/PlanItemBucketChip";
import withStyles from "@mui/styles/withStyles";
import { moveSubtree } from "../../Planner/components/Plan";

type Props = PropsWithChildren<unknown>;

export const drawerWidth = 200;
const BUCKET_PREFIX = "bucket-";
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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

interface RecipeInfo extends PlanItem {
    depth: number;
    bucket?: Maybe<PlanBucket>;
    photo: Recipe["photo"];
}

const BodyContainer: React.FC<Props> = () => {
    const plan = useFluxStore(() => {
        const { data: plan, loading } = planStore.getActivePlanRlo();
        if (!plan || loading) return null;
        const recipes: RecipeInfo[] = [];
        const dfs = (it: PlanItem, depth: number) => {
            if (it.ingredientId) {
                const ing = LibraryStore.getIngredientRloById(it.ingredientId)
                    .data as Recipe;
                if (ing && ing.type === "Recipe") {
                    recipes.push({
                        ...it,
                        depth,
                        photo: ing.photo,
                    });
                }
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
            recipes.sort((a, b) => {
                const ab = a.bucket;
                const bb = b.bucket;
                if (ab === bb) return 0;
                if (ab == null) return +1;
                if (bb == null) return -1;
                return bucketComparator(ab, bb);
            });
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

    let prevBucket: Maybe<PlanBucket>;
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
                const doMove = target
                    ? moveSubtree.bind(null, activeId, target, "none", vertical)
                    : // eslint-disable-next-line @typescript-eslint/no-empty-function
                      noop;
                // triple equals doesn't equate null and undefined, but Maybe allows either
                // eslint-disable-next-line eqeqeq
                if (act.bucket != targetBucket) {
                    assignItemToBucket(act.id, targetBucket?.id);
                    setTimeout(doMove, 1000); // todo: ghetto! PlanApi is supposed to single-thread, but it doesn't?!
                } else {
                    doMove();
                }
            }}
        >
            <List dense>
                <Header>{plan.name}</Header>
                {plan.recipes.map((item) => {
                    const ri = renderItem(item);
                    if (item.bucket === prevBucket) return ri;
                    const toDraw: PlanBucket[] = [];
                    let hot = prevBucket == null;
                    for (const b of plan.buckets) {
                        if (hot) toDraw.push(b);
                        if (b === item.bucket) break;
                        if (b === prevBucket) hot = true;
                    }
                    prevBucket = item.bucket;
                    return (
                        <React.Fragment key={item.id}>
                            {toDraw.map((b) => (
                                <Bucket key={b.id} bucket={b}></Bucket>
                            ))}
                            {!item.bucket && <Bucket />}
                            {ri}
                        </React.Fragment>
                    );
                })}
                {prevBucket && <Bucket />}
            </List>
        </DragContainer>
    );
};

const Subheader = withStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(1),
        color: theme.palette.text.secondary,
        borderTop: `1px solid ${theme.palette.divider}`,
    },
}))(DndItem);

const Bucket = ({ bucket }: { bucket?: PlanBucket }) => {
    return (
        <Subheader dragId={BUCKET_PREFIX + (bucket ? bucket.id : -1)} noDrag>
            <ListItemText
                primary={
                    bucket ? getBucketLabel(bucket) : "Ain't Got No Bucket"
                }
            />
        </Subheader>
    );
};

interface PlannedRecipeProps {
    item: RecipeInfo;
}

const PlannedRecipe: React.FC<PlannedRecipeProps> = ({ item }) => {
    const [showing, setShowing] = useState(false);
    const goingAway =
        item._next_status === PlanItemStatus.COMPLETED ||
        item._next_status === PlanItemStatus.DELETED;
    return (
        <DndItem key={item.id} dragId={item.id} position={"relative"}>
            <ListItemText
                onMouseEnter={() => setShowing(true)}
                onMouseLeave={() => setShowing(false)}
                disableTypography
            >
                <Typography
                    component={goingAway ? "del" : "div"}
                    variant={"body2"}
                    fontWeight={"bold"}
                >
                    {item.name}
                    <span
                        style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            display: showing || goingAway ? "block" : "none",
                        }}
                    >
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
                    </span>
                </Typography>
            </ListItemText>
        </DndItem>
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
