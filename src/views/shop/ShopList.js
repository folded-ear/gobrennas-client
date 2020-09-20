import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from "@material-ui/core/List";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import ShoppingActions from "../../data/ShoppingActions";
import { clientOrDatabaseIdType } from "../../util/ClientId";
import loadObjectOf from "../../util/loadObjectOf";
import LoadingIndicator from "../common/LoadingIndicator";
import Ingredient from "./IngredientItem";
import TaskItem from "./TaskItem";
import {
    baseItemPropTypes,
    itemPropTypes,
} from "./types";

class ShopList extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onTogglePlan = this.onTogglePlan.bind(this);
    }

    onTogglePlan(e) {
        e.stopPropagation();
        Dispatcher.dispatch({
            type: ShoppingActions.TOGGLE_PLAN,
            id: parseInt(e.target.value, 10),
        });
    }

    render() {
        const {
            allPlans: allPlansLO,
            itemTuples,
            isActive,
        } = this.props;
        if (!allPlansLO.hasValue()) {
            return <LoadingIndicator
                primary="Loading shopping list..."
            />;
        }
        const allPlans = allPlansLO.getValueEnforcing();
        return <>
            {allPlans.map(p =>
                <FormControlLabel
                    key={p.id}
                    control={<Checkbox
                        value={p.id}
                        checked={p.selected}
                        onChange={this.onTogglePlan}
                    />}
                    label={p.name}
                />
            )}
            <List>
                {itemTuples.map(it => {
                    if (it._type === "ingredient") {
                        return <Ingredient
                            key={it.id + it._type}
                            item={it}
                            active={isActive(it)}
                        />;
                    } else {
                        return <TaskItem
                            key={it.id}
                            depth={it.depth}
                            item={it}
                            active={isActive(it)}
                        />;
                    }
                })}
            </List>
        </>;
    }

}

ShopList.propTypes = {
    allPlans: loadObjectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                id: clientOrDatabaseIdType.isRequired,
                name: PropTypes.string.isRequired,
                selected: PropTypes.bool.isRequired,
            }))).isRequired,
    itemTuples: PropTypes.arrayOf(
        PropTypes.shape({
            _type: PropTypes.oneOf(["ingredient", "item", "raw"]).isRequired,
            ...itemPropTypes,
            // for ingredient
            itemIds: PropTypes.arrayOf(clientOrDatabaseIdType),
            quantities: PropTypes.arrayOf(
                PropTypes.shape({
                    quantity: PropTypes.number.isRequired,
                    uomId: PropTypes.number, // missing means "count"
                })),
            // for item
            path: PropTypes.arrayOf(PropTypes.shape(baseItemPropTypes)),
        })).isRequired,
    isActive: PropTypes.func.isRequired,
};

export default ShopList;