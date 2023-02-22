import { ListItemText } from "@material-ui/core";
import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import PantryItemActions from "../../data/PantryItemActions";
import ShoppingActions from "../../data/ShoppingActions";
import TaskStatus from "features/Planner/data/TaskStatus";
import { clientOrDatabaseIdType } from "../../util/ClientId";
import LoadingIconButton from "../common/LoadingIconButton";
import OxfordList from "../common/OxfordList";
import Quantity from "../common/Quantity";
import CollapseIconButton from "global/components/CollapseIconButton";
import DontChangeStatusButton from "features/Planner/components/DontChangeStatusButton";
import Item from "features/Planner/components/Item";
import StatusIconButton from "features/Planner/components/StatusIconButton";
import withItemStyles from "features/Planner/components/withItemStyles";
import {
    itemPropTypes,
    tuplePropTypes,
} from "./types";

class IngredientItem extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onSetStatus = this.onSetStatus.bind(this);
        this.onUndoSetStatus = this.onUndoSetStatus.bind(this);
        this.onToggleExpanded = this.onToggleExpanded.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onDragDrop = this.onDragDrop.bind(this);
    }

    onSetStatus(status, e) {
        if (e) e.stopPropagation();
        const {
            item: {
                id,
                itemIds,
            },
        } = this.props;
        Dispatcher.dispatch({
            type: ShoppingActions.SET_INGREDIENT_STATUS,
            id,
            itemIds,
            status,
        });
    }

    onUndoSetStatus(e) {
        if (e) e.stopPropagation();
        const {
            item: {
                id,
                itemIds,
            },
        } = this.props;
        Dispatcher.dispatch({
            type: ShoppingActions.UNDO_SET_INGREDIENT_STATUS,
            id,
            itemIds,
        });
    }

    onToggleExpanded(e) {
        if (e) e.stopPropagation();
        Dispatcher.dispatch({
            type: ShoppingActions.TOGGLE_EXPANDED,
            id: this.props.item.id,
        });
    }

    onClick(e) {
        const {
            item,
        } = this.props;
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) return;
        Dispatcher.dispatch({
            type: ShoppingActions.FOCUS,
            id: item.id,
            itemType: "ingredient",
        });
    }

    onDragDrop(id, targetId, v) {
        Dispatcher.dispatch({
            type: PantryItemActions.ORDER_FOR_STORE,
            id,
            targetId,
            after: v !== "above",
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
            loading,
            deleting,
            acquiring,
        } = item;
        let addonBefore = [
            <CollapseIconButton
                key="collapse"
                expanded={expanded}
                onClick={this.onToggleExpanded}
            />
        ];
        if (loading) {
            addonBefore.push(
                <LoadingIconButton
                    key="acquire"
                />);
        } else {
            const next = acquiring ? TaskStatus.NEEDED : TaskStatus.ACQUIRED;
            addonBefore.push(
                <StatusIconButton
                    key="acquire"
                    current={acquiring ? TaskStatus.ACQUIRED : TaskStatus.NEEDED}
                    next={next}
                    onClick={e => this.onSetStatus(next, e)}
                />);
        }
        const addonAfter = deleting
            ? <DontChangeStatusButton
                key="delete"
                next={TaskStatus.DELETED}
                onClick={e => this.onUndoSetStatus(e)}
            />
            : null;
        return <Item
            prefix={addonBefore}
            suffix={addonAfter}
            selected={active}
            onClick={this.onClick}
            className={classnames({
                [classes.acquiring]: acquiring,
                [classes.deleting]: deleting,
            })}
            dragId={item.id}
            onDragDrop={this.onDragDrop}
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
                            units={q.units}
                        />)
                    }
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
