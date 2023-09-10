import {
    Box,
    Typography
} from "@mui/material";
import List from "@mui/material/List";
import Add from "@mui/icons-material/Add";
import React, {
    useCallback,
    useState
} from "react";
import Dispatcher from "data/dispatcher";
import ShoppingActions from "data/ShoppingActions";
import FoodingerFab from "views/common/FoodingerFab";
import LoadingIndicator from "views/common/LoadingIndicator";
import PageBody from "views/common/PageBody";
import IngredientItem from "views/shop/IngredientItem";
import PlanItem from "views/shop/PlanItem";
import {
    BaseItemProp,
    ItemProps,
} from "./types";
import { PlanItem as PlanItemType } from "features/Planner/data/planStore";
import {
    BfsId,
    Quantity
} from "global/types/types";
import CollapseIconButton from "../../global/components/CollapseIconButton";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    rectIntersection
} from "@dnd-kit/core";
import PantryItemActions from "../../data/PantryItemActions";

export enum ShopItemType {
    INGREDIENT,
    PLAN_ITEM,
}

export interface ShopItemTuple extends ItemProps {
    blockId?: BfsId
    _type: ShopItemType
    active?: boolean
    depth: number
    expanded?: boolean
    itemIds?: BfsId[]
    quantities?: Quantity[]
    path: BaseItemProp[]
}

export type ShopListProps = {
    plan: PlanItemType | null | undefined
    neededTuples: ShopItemTuple[]
    acquiredTuples: ShopItemTuple[]
    onRepartition(): void
}

interface TupleListProps {
    tuples: ShopItemTuple[]
}

function renderItem(it?: ShopItemTuple) {
    if (!it) return null;
    if (it._type === ShopItemType.INGREDIENT) {
        return <IngredientItem
            key={it.id + "-ing-item"}
            item={it}
            active={it.expanded}
        />;
    } else {
        return <PlanItem
            key={it.id}
            depth={it.depth}
            item={it}
            active={it.active}
        />;
    }
}

const TupleList: React.FC<TupleListProps> = ({
                                                 tuples,
                                             }) => {
    const [ activeId, setActiveId ] = useState(undefined);

    function handleDragStart(event) {
        setActiveId(event.active.id);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(undefined);
        if (!event.over) return;
        const id = event.active.id;
        const targetId = event.over.id;
        if (id === targetId) return;
        const finalRect = event.active.rect.current.translated;
        const overRect = event.over.rect;
        Dispatcher.dispatch({
            type: PantryItemActions.ORDER_FOR_STORE,
            id,
            targetId,
            after: finalRect
                ? finalRect.top >= overRect.top
                : true,
        });
    }

    return <DndContext onDragEnd={handleDragEnd}
                       onDragStart={handleDragStart}
                       collisionDetection={rectIntersection}>
        <List>
            {tuples.map(renderItem)}
        </List>
        <DragOverlay>
            {activeId
                ? <Box style={{
                    backgroundColor: "#dddddd",
                    opacity: 0.9,
                }}>
                    {renderItem(tuples.find(it =>
                        it.id === activeId))}
                </Box>
                : null}
        </DragOverlay>
    </DndContext>;
};

const ShopList: React.FC<ShopListProps> = ({
                                               plan,
                                               neededTuples,
                                               acquiredTuples,
                                               onRepartition,
                                           }) => {
    const [ showAcquired, setShowAcquired ] = useState(false);

    const handleAddNew = useCallback(
        (e) => {
            e.preventDefault();
            Dispatcher.dispatch({
                type: ShoppingActions.CREATE_ITEM_AT_END,
            });
        },
        []
    );

    const handleToggleAcquired = useCallback(
        () => {
            setShowAcquired(v => !v);
            onRepartition();
        },
        [ onRepartition ]
    );

    if (!plan) {
        return <LoadingIndicator
            primary="Loading shopping list..."
        />;
    }

    return <PageBody hasFab fullWidth>
        <Box mx={2} my={1}>
            <Typography variant="h2">{plan.name}</Typography>
        </Box>
        <TupleList tuples={neededTuples} />
        {acquiredTuples.length > 0 && <Box mt={2}>
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
        </Box>}
        <FoodingerFab
            onClick={handleAddNew}
        >
            <Add />
        </FoodingerFab>
    </PageBody>;
};

export default ShopList;
