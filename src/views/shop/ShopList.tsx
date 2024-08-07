import { Box, IconButton, Stack, Typography } from "@mui/material";
import List from "@mui/material/List";
import React, { useCallback, useState } from "react";
import Dispatcher from "data/dispatcher";
import ShoppingActions from "data/ShoppingActions";
import FoodingerFab from "views/common/FoodingerFab";
import LoadingIndicator from "views/common/LoadingIndicator";
import PageBody from "views/common/PageBody";
import IngredientItem from "views/shop/IngredientItem";
import PlanItem from "views/shop/PlanItem";
import { BaseItemProp, ItemProps } from "./types";
import { PlanItem as PlanItemType } from "features/Planner/data/planStore";
import type { Quantity } from "global/types/types";
import type { BfsId } from "global/types/identity";
import CollapseIconButton from "../../global/components/CollapseIconButton";
import PantryItemActions from "../../data/PantryItemActions";
import DragContainer, {
    DragContainerProps,
} from "../../features/Planner/components/DragContainer";
import { AddIcon, SweepIcon } from "views/common/icons";
import { useIsMobile } from "../../providers/IsMobile";
import MobilePlanSelector from "./MobilePlanSelector";
import useAllPlansRLO from "../../data/useAllPlansRLO";
import { NavShopItem } from "../../features/Navigation/components/NavShopItem";
import { toggleShoppingPlan } from "../../features/Navigation/NavigationController";
import PlanAvatar from "./PlanAvatar";

export enum ShopItemType {
    INGREDIENT,
    PLAN_ITEM,
}

export interface ShopItemTuple extends ItemProps {
    blockId?: BfsId;
    _type: ShopItemType;
    active?: boolean;
    depth: number;
    expanded?: boolean;
    storeOrder?: number;
    itemIds?: BfsId[];
    quantities?: Quantity[];
    path: BaseItemProp[];
}

export type ShopListProps = {
    plans: PlanItemType[];
    neededTuples: ShopItemTuple[];
    acquiredTuples: ShopItemTuple[];
    onRepartition(): void;
};

interface TupleListProps {
    tuples: ShopItemTuple[];
}

function renderItem(it?: ShopItemTuple) {
    if (!it) return null;
    if (it._type === ShopItemType.INGREDIENT) {
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
        Dispatcher.dispatch({
            type: PantryItemActions.ORDER_FOR_STORE,
            id,
            targetId,
            after: vertical === "below",
        });
    };

    return (
        <DragContainer
            onDrop={handleDrop}
            renderOverlay={(id) =>
                renderItem(tuples.find((it) => it.id === id))
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

    const handleAddNew = useCallback((e) => {
        e.preventDefault();
        Dispatcher.dispatch({
            type: ShoppingActions.CREATE_ITEM_AT_END,
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
        <PageBody hasFab fullWidth>
            <Box mx={showPlanSelector ? 0 : 1}>
                <Typography variant="h2">
                    <Stack direction="row" alignItems={"center"} spacing={1}>
                        {showPlanSelector && (
                            <CollapseIconButton
                                size={"medium"}
                                expanded={planSelectorOpen}
                                onClick={() => setPlanSelectorOpen((o) => !o)}
                            />
                        )}
                        {plans.length === 1 ? (
                            plans[0].name
                        ) : (
                            <Stack direction={"row"} gap={1}>
                                <span>Shop</span>
                                {plans.map((p) => (
                                    <PlanAvatar key={p.id} plan={p} />
                                ))}
                            </Stack>
                        )}
                        <IconButton
                            title={"Sweep Acquired"}
                            onClick={() => onRepartition()}
                        >
                            <SweepIcon />
                        </IconButton>
                    </Stack>
                </Typography>
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
