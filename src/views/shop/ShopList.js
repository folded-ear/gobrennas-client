import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from "@material-ui/core/List";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import ShoppingActions from "../../data/ShoppingActions";
import { clientOrDatabaseIdType } from "../../util/ClientId";
import LoadObject from "../../util/LoadObject";
import loadObjectOf from "../../util/loadObjectOf";
import LoadingIndicator from "../common/LoadingIndicator";
import Task from "../plan/Task";

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
                {itemTuples.map(it =>
                    <Task
                        key={it.id + it._type}
                        depth={it._type === "item" ? 1 : 0}
                        task={it}
                        loadObject={LoadObject.empty()}
                    />)}
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
            // for item
            path: PropTypes.arrayOf(PropTypes.shape({
                id: clientOrDatabaseIdType.isRequired,
                name: PropTypes.string.isRequired,
            })),
        })).isRequired,
};

export default ShopList;