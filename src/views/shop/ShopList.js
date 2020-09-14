import { ListItemText } from "@material-ui/core";
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
import OxfordList from "../common/OxfordList";
import Quantity from "../common/Quantity";
import Item from "../plan/Item";
import Raw from "./Raw";

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
                        return <Item
                            key={it.id + it._type}
                            depth={0}
                        >
                            {/* todo: to be wrapped... */}
                            <ListItemText>
                                {it.name}
                                <OxfordList
                                    prefix=" ("
                                    suffix=")"
                                >
                                    {it.quantities.map(q =>
                                        <Quantity
                                            key={q.uomId || "count"}
                                            quantity={q.quantity}
                                            units={q.uomId ? `u#${q.uomId}` : null}
                                        />)
                                    }
                                </OxfordList>
                            </ListItemText>
                        </Item>;
                    } else if (it._type === "item") {
                        return <Item
                            key={it.id + it._type}
                            depth={1}
                        >
                            {/* todo: to be wrapped... */}
                            <ListItemText>
                                {it.name}
                                {it.path.map(p => " / " + p.name).join("")}
                            </ListItemText>
                        </Item>;
                    } else { // raw (or anything else)
                        return <Raw
                            key={it.id + it._type}
                            depth={it._type === "item" ? 1 : 0}
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
            id: clientOrDatabaseIdType.isRequired, // either the ingredient or the single backing task
            name: PropTypes.string.isRequired,
            // for ingredient
            itemIds: PropTypes.arrayOf(clientOrDatabaseIdType),
            quantities: PropTypes.arrayOf(
                PropTypes.shape({
                    quantity: PropTypes.number.isRequired,
                    uomId: PropTypes.number, // missing means "count"
                })),
            // for item
            path: PropTypes.arrayOf(PropTypes.shape({
                id: clientOrDatabaseIdType.isRequired,
                name: PropTypes.string.isRequired,
            })),
        })).isRequired,
    isActive: PropTypes.func.isRequired,
};

export default ShopList;