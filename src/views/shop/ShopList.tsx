import { Typography } from "@mui/material";
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
import { Quantity } from "global/types/types";
import CollapseIconButton from "../../global/components/CollapseIconButton";

export enum ShopItemType {
    INGREDIENT,
    PLAN_ITEM,
}

export interface ShopItemTuple extends ItemProps {
    blockId?: string | number
    _type: ShopItemType
    active?: boolean
    depth: number
    expanded?: boolean
    itemIds?: (string | number)[]
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

const TupleList: React.FC<TupleListProps> = ({
                                                 tuples,
                                             }) => {
    return <List>
        {tuples.map(it => {
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
        })}
    </List>;
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

    return <PageBody hasFab>
        <Typography variant="h2">{plan.name}</Typography>
        <TupleList tuples={neededTuples} />
        {acquiredTuples.length > 0 && <>
            <Typography variant="h5">
                <CollapseIconButton
                    key="collapse"
                    expanded={showAcquired}
                    onClick={handleToggleAcquired}
                />
                <span onClick={handleToggleAcquired}>
                    Acquired
                </span>
            </Typography>
            {showAcquired && <TupleList tuples={acquiredTuples} />}
        </>}
        <FoodingerFab
            onClick={handleAddNew}
        >
            <Add />
        </FoodingerFab>
    </PageBody>;
};

export default ShopList;
