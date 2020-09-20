import { ListItemText } from "@material-ui/core";
import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import ShoppingActions from "../../data/ShoppingActions";
import TaskStatus from "../../data/TaskStatus";
import { clientOrDatabaseIdType } from "../../util/ClientId";
import LoadingIconButton from "../common/LoadingIconButton";
import OxfordList from "../common/OxfordList";
import Quantity from "../common/Quantity";
import CollapseIconButton from "../plan/CollapseIconButton";
import DontChangeStatusButton from "../plan/DontChangeStatusButton";
import Item from "../plan/Item";
import StatusIconButton from "../plan/StatusIconButton";
import withItemStyles from "../plan/withItemStyles";
import {
    itemPropTypes,
    tuplePropTypes,
} from "./types";

class IngredientItem extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onToggleExpanded = this.onToggleExpanded.bind(this);
    }

    onToggleExpanded(e) {
        if (e) e.preventDefault();
        Dispatcher.dispatch({
            type: ShoppingActions.TOGGLE_EXPANDED,
            id: this.props.item.id,
        });
    }


    render() {
        const {
            item,
            active,
            classes,
        } = this.props;
        const {
            expanded,
            pending,
            deleting,
            completing,
            acquiring,
        } = item;
        let addonBefore = [
            <CollapseIconButton
                key="collapse"
                expanded={expanded}
                onClick={this.onToggleExpanded}
            />
        ];
        if (pending) {
            addonBefore.push(
                <LoadingIconButton
                    key="acquire"
                    size="small"
                />);
        } else {
            addonBefore.push(
                <StatusIconButton
                    key="acquire"
                    id={item.id}
                    current={TaskStatus.NEEDED}
                    next={TaskStatus.ACQUIRED}
                />);
        }
        const addonAfter = deleting || completing || acquiring
            ? <DontChangeStatusButton
                key="delete"
                id={item.id}
                next={item._next_status}
            />
            : <StatusIconButton
                key="delete"
                id={item.id}
                next={TaskStatus.DELETED}
            />;
        addonBefore.push();
        return <Item
            prefix={addonBefore}
            suffix={addonAfter}
            selected={active}
            className={classnames({
                [classes.acquiring]: acquiring,
                [classes.completing]: completing,
                [classes.deleting]: deleting,
            })}
        >
            <ListItemText>
                {item.name}
                <OxfordList
                    prefix=" ("
                    suffix=")"
                >
                    {item.quantities.map(q =>
                        <Quantity
                            key={q.uomId || "count"}
                            quantity={q.quantity}
                            units={q.uomId ? `u#${q.uomId}` : null}
                        />)
                    }
                </OxfordList>
                <OxfordList
                    prefix=" ["
                    suffix="]"
                >
                    {item.itemIds}
                </OxfordList>
            </ListItemText>
        </Item>;
    }

}

IngredientItem.propTypes = {
    ...tuplePropTypes,
    item: PropTypes.shape({
        ...itemPropTypes,
        expanded: PropTypes.bool.isRequired,
        itemIds: PropTypes.arrayOf(clientOrDatabaseIdType).isRequired,
        quantities: PropTypes.arrayOf(
            PropTypes.shape({
                quantity: PropTypes.number.isRequired,
                uomId: PropTypes.number, // missing means "count"
            })).isRequired,
    }).isRequired,
};

export default withItemStyles(IngredientItem);
