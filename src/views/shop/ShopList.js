import { Typography } from "@material-ui/core";
import List from "@material-ui/core/List";
import Add from "@material-ui/icons/Add";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "data/dispatcher";
import ShoppingActions from "data/ShoppingActions";
import { clientOrDatabaseIdType } from "util/ClientId";
import { loadObjectOf } from "util/loadObjectTypes";
import FoodingerFab from "views/common/FoodingerFab";
import LoadingIndicator from "views/common/LoadingIndicator";
import PageBody from "views/common/PageBody";
import Ingredient from "views/shop/IngredientItem";
import TaskItem from "views/shop/TaskItem";
import {
    baseItemPropTypes,
    itemPropTypes,
} from "./types";

class ShopList extends React.PureComponent {

    constructor(...args) {
        super(...args);
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

ShopList.propTypes = {
    planLO: loadObjectOf(
        PropTypes.shape({
            id: clientOrDatabaseIdType.isRequired,
            name: PropTypes.string.isRequired,
        })).isRequired,
    itemTuples: PropTypes.arrayOf(
        PropTypes.shape({
            _type: PropTypes.oneOf(["ingredient", "task"]),
            ...itemPropTypes,
            // for ingredient
            expanded: PropTypes.bool,
            itemIds: PropTypes.arrayOf(clientOrDatabaseIdType),
            quantities: PropTypes.arrayOf(
                PropTypes.shape({
                    quantity: PropTypes.number.isRequired,
                    uomId: PropTypes.number, // missing means "count"
                })),
            // for item
            path: PropTypes.arrayOf(PropTypes.shape(baseItemPropTypes)),
        })).isRequired,
};

export default ShopList;
