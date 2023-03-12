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
    baseItemPropTypes,
    itemPropTypes,
} from "./types";
import LoadObject from "../../util/LoadObject";
import { Plan } from "global/types/types";

type ShopListProps = {
    planLO: LoadObject<Plan>
    itemTuples: itemPropTypes & {
      id: string,
      _type: "ingredient" | "task",
      active: boolean;
      depth: number;
      expanded: boolean,
      itemIds: string[],
      quantities: {
          quantity: number,
          uomId?: number,
      }[],
      path: baseItemPropTypes[]
    }[]
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
