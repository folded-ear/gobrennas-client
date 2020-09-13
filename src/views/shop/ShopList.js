import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import ShoppingActions from "../../data/ShoppingActions";
import { clientOrDatabaseIdType } from "../../util/ClientId";
import loadObjectOf from "../../util/loadObjectOf";
import LoadingIndicator from "../common/LoadingIndicator";

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
        </>;
    }

}

ShopList.propTypes = {
    allPlans: loadObjectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                id: clientOrDatabaseIdType,
                name: PropTypes.string.isRequired,
                selected: PropTypes.bool.isRequired,
            }))).isRequired,
};

export default ShopList;