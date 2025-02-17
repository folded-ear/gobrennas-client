import dispatcher, { ActionType } from "@/data/dispatcher";
import useAllPlansRLO from "@/data/useAllPlansRLO";
import { NavShopItem } from "@/features/Navigation/components/NavShopItem";
import { toggleShoppingPlan } from "@/features/Navigation/NavigationController";
import DragContainer, {
    DragContainerProps,
} from "@/features/Planner/components/DragContainer";
import { Plan as TPlan } from "@/features/Planner/data/planStore";
import CollapseIconButton from "@/global/components/CollapseIconButton";
import { BfsId, bfsIdEq } from "@/global/types/identity";
import type { Quantity } from "@/global/types/types";
import { useIsMobile } from "@/providers/IsMobile";
import FoodingerFab from "@/views/common/FoodingerFab";
import { AddIcon, CollapseIcon, SweepIcon } from "@/views/common/icons";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import PageBody from "@/views/common/PageBody";
import IngredientItem from "@/views/shop/IngredientItem";
import PlanItem from "@/views/shop/PlanItem";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import List from "@mui/material/List";
import * as React from "react";
import { useCallback, useState } from "react";
import MobilePlanSelector from "./MobilePlanSelector";
import PlanAvatar from "./PlanAvatar";
import { BaseItemProp, ItemProps } from "./types";

export enum ShopItemType {
    INGREDIENT,
    PLAN_ITEM,
}

export interface CoreItemTuple extends ItemProps {
    _type: ShopItemType;
    active?: boolean;
    depth: number;
    path: BaseItemProp[];
}

export interface IngredientTuple extends CoreItemTuple {
    expanded: boolean;
    storeOrder?: number;
    itemIds: BfsId[];
    quantities: Quantity[];
}

export interface PlanItemTuple extends CoreItemTuple {
    blockId?: BfsId;
}

export type ShopItemTuples = Array<IngredientTuple | PlanItemTuple>;

type ShopListProps = {
    plans: TPlan[];
    neededTuples: ShopItemTuples;
    acquiredTuples: ShopItemTuples;
    onRepartition(): void;
};

interface TupleListProps {
    tuples: ShopItemTuples;
}

function renderItem(it?: IngredientTuple | PlanItemTuple) {
    if (!it) return null;
    if ("itemIds" in it) {
        // it's an ingredient/aggregate
        return (
            <IngredientItem
                key={it.id + "-ing-item"}
                item={it}
                active={it.expanded}
            />
        );
    } else {
        return (
            <PlanItem
                key={it.id}
                depth={it.depth}
                item={it}
                active={it.active}
            />
        );
    }
}

const TupleList: React.FC<TupleListProps> = ({ tuples }) => {
    const handleDrop: DragContainerProps["onDrop"] = (
        id,
        targetId,
        vertical,
    ) => {
        dispatcher.dispatch({
            type: ActionType.PANTRY_ITEM__ORDER_FOR_STORE,
            id,
            targetId,
            after: vertical === "below",
        });
    };

    return (
        <DragContainer
            onDrop={handleDrop}
            renderOverlay={(id) =>
                renderItem(tuples.find((it) => bfsIdEq(it.id, id)))
            }
        >
            <List>{tuples.map(renderItem)}</List>
        </DragContainer>
    );
};

const ShopList: React.FC<ShopListProps> = ({
    plans,
    neededTuples,
    acquiredTuples,
    onRepartition,
}) => {
    const [showAcquired, setShowAcquired] = useState(false);
    const allPlans = useAllPlansRLO().data;
    const showPlanSelector = useIsMobile() && allPlans && allPlans.length >= 2;
    const [planSelectorOpen, setPlanSelectorOpen] = useState(false);

    const handleAddNew = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        dispatcher.dispatch({
            type: ActionType.SHOPPING__CREATE_ITEM_AT_END,
        });
    }, []);

    const handleToggleAcquired = useCallback(() => {
        setShowAcquired((v) => !v);
        onRepartition();
    }, [onRepartition]);

    if (plans == null || plans.length === 0) {
        return <LoadingIndicator primary="Loading shopping list..." />;
    }

    return (
        <PageBody>
            <Box mx={showPlanSelector ? 0 : 1}>
                <Stack direction="row" justifyContent={"space-between"}>
                    <Stack direction="row" alignItems={"center"} spacing={1}>
                        {showPlanSelector ? (
                            <CollapseIconButton
                                size={"medium"}
                                Icon={CollapseIcon}
                                expanded={planSelectorOpen}
                                onClick={() => setPlanSelectorOpen((o) => !o)}
                                sx={{
                                    color: plans[0].color,
                                }}
                            />
                        ) : (
                            <PlanAvatar plan={plans[0]} empty />
                        )}
                        <Typography variant="h2">{plans[0].name}</Typography>
                        {plans.slice(1).map((p) => (
                            <PlanAvatar key={p.id} plan={p} />
                        ))}
                    </Stack>
                    <Stack
                        direction="row"
                        alignItems={"center"}
                        spacing={1}
                        mr={1}
                    >
                        <IconButton
                            title={"Sweep Acquired"}
                            onClick={() => onRepartition()}
                        >
                            <SweepIcon />
                        </IconButton>
                    </Stack>
                </Stack>
                {showPlanSelector && (
                    <MobilePlanSelector
                        open={planSelectorOpen}
                        PlanItem={NavShopItem}
                        onSelectPlan={toggleShoppingPlan}
                    />
                )}
            </Box>
            <TupleList tuples={neededTuples} />
            {acquiredTuples.length > 0 && (
                <Box mt={2}>
                    <Typography variant="h5">
                        <CollapseIconButton
                            key="collapse"
                            expanded={showAcquired}
                            onClick={handleToggleAcquired}
                        />
                        <span onClick={handleToggleAcquired}>
                            Acquired ({acquiredTuples.length})
                        </span>
                    </Typography>
                    {showAcquired && <TupleList tuples={acquiredTuples} />}
                </Box>
            )}
            <FoodingerFab onClick={handleAddNew}>
                <AddIcon />
            </FoodingerFab>
        </PageBody>
    );
};

export default ShopList;
