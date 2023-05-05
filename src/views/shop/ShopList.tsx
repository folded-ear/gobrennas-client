import { Typography } from "@mui/material";
import List from "@mui/material/List";
import Add from "@mui/icons-material/Add";
import React from "react";
import Dispatcher from "data/dispatcher";
import ShoppingActions from "data/ShoppingActions";
import FoodingerFab from "views/common/FoodingerFab";
import LoadingIndicator from "views/common/LoadingIndicator";
import PageBody from "views/common/PageBody";
import Ingredient from "views/shop/IngredientItem";
import PlanItem from "views/shop/PlanItem";
import {
    BaseItemProp,
    ItemProps,
} from "./types";
import { PlanItem as PlanItemType } from "features/Planner/data/planStore";
import { Quantity } from "global/types/types";

export enum ShopItemType {
    INGREDIENT,
    PLAN_ITEM,
}

export interface ShopItemTuple extends ItemProps {
    id: string | number
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
    itemTuples: ShopItemTuple[]
}

class ShopList extends React.PureComponent<ShopListProps> {

    constructor(args: ShopListProps) {
        super(args);
        this.onAddNew = this.onAddNew.bind(this);
    }


    onAddNew(e) {
        e.preventDefault();
        Dispatcher.dispatch({
            type: ShoppingActions.CREATE_ITEM_AT_END,
        });
    }

    render() {
        const {
            plan,
            itemTuples,
        } = this.props;
        if (!plan) {
            return <LoadingIndicator
                primary="Loading shopping list..."
            />;
        }
        return <PageBody hasFab>
            <Typography variant="h2">{plan.name}</Typography>
            <List>
                {itemTuples.map(it => {
                    if (it._type === ShopItemType.INGREDIENT) {
                        return <Ingredient
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
            </List>
            <FoodingerFab
                onClick={this.onAddNew}
            >
                <Add />
            </FoodingerFab>
        </PageBody>;
    }

}

export default ShopList;
