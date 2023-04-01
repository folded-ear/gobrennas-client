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
import TaskItem from "views/shop/TaskItem";
import {
    BaseItemProp,
    ItemProps,
} from "./types";
import LoadObject from "../../util/LoadObject";
import { Task } from "../../features/Planner/data/TaskStore";
import { Quantity } from "../../global/types/types";

export enum ShopItemType {
    INGREDIENT = "ingredient",
    TASK = "task",
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
    planLO: LoadObject<Task>
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
            planLO,
            itemTuples,
        } = this.props;
        if (!planLO.hasValue()) {
            return <LoadingIndicator
                primary="Loading shopping list..."
            />;
        }
        const plan = planLO.getValueEnforcing();
        return <PageBody hasFab>
            <Typography variant="h2">{plan.name}</Typography>
            <List>
                {itemTuples.map(it => {
                    if (it._type === "ingredient") {
                        return <Ingredient
                            key={it.id + it._type}
                            item={it}
                            active={it.expanded}
                        />;
                    } else {
                        return <TaskItem
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
