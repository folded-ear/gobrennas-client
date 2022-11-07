import { ListItemText } from "@material-ui/core";
import Input from "@material-ui/core/Input";
import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import ShoppingActions from "../../data/ShoppingActions";
import TaskStatus from "features/Planner/data/TaskStatus";
import LoadingIconButton from "../common/LoadingIconButton";
import PlaceholderIconButton from "../common/PlaceholderIconButton";
import IngredientItem from "../IngredientItem";
import DontChangeStatusButton from "features/Planner/components/DontChangeStatusButton";
import Item from "features/Planner/components/Item";
import StatusIconButton from "features/Planner/components/StatusIconButton";
import withItemStyles from "features/Planner/components/withItemStyles";
import {
    baseItemPropTypes,
    itemPropTypes,
    tuplePropTypes,
} from "./types";

class TaskItem extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.inputRef = React.createRef();
    }

    onChange(e) {
        const { value } = e.target;
        const {
            item,
        } = this.props;
        Dispatcher.dispatch({
            type: ShoppingActions.RENAME_ITEM,
            id: item.id,
            name: value,
        });
    }

    onClick(e) {
        const {
            active,
            item,
        } = this.props;
        if (active) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) return;
        Dispatcher.dispatch({
            type: ShoppingActions.FOCUS,
            id: item.id,
            itemType: "task",
        });
    }

    onKeyDown(e) {
        const {
            value,
            selectionStart,
        } = e.target;
        const {
            key,
        } = e;
        switch (key) { // eslint-disable-line default-case
            case "Enter":
                if (value.length === 0) break;
                // add a new item, before if the cursor is at the beginning, after otherwise
                Dispatcher.dispatch({
                    type: selectionStart === 0
                        ? ShoppingActions.CREATE_ITEM_BEFORE
                        : ShoppingActions.CREATE_ITEM_AFTER,
                    id: this.props.item.id,
                });
                break;
            case "Backspace":
                // if the value is empty, delete the task and focus previous
                if (value.length === 0) {
                    e.preventDefault();
                    Dispatcher.dispatch({
                        type: ShoppingActions.DELETE_ITEM_BACKWARDS,
                        id: this.props.item.id
                    });
                }
                break;
            case "Delete":
                // if the value is empty, delete the task and focus next
                if (value.length === 0) {
                    e.preventDefault();
                    Dispatcher.dispatch({
                        type: ShoppingActions.DELETE_ITEM_FORWARD,
                        id: this.props.item.id,
                    });
                }
                break;
        }
    }

    componentDidMount() {
        if (this.props.active) this.inputRef.current.focus();
    }

    componentDidUpdate() {
        if (this.props.active) this.inputRef.current.focus();
    }

    render() {
        const {
            item,
            depth,
            active,
            classes,
        } = this.props;
        const {
            question,
            loading,
            deleting,
            acquiring,
            needing,
        } = item;
        let addonBefore = [
            <PlaceholderIconButton
                key="collapse"
                size="small"
            />
        ];
        if (loading || deleting) {
            addonBefore.push(
                <LoadingIconButton
                    key="acquire"
                />);
        } else {
            const curr = item._next_status || item.status;
            addonBefore.push(
                <StatusIconButton
                    key="acquire"
                    id={item.id}
                    current={curr}
                    next={curr === TaskStatus.ACQUIRED ? TaskStatus.NEEDED : TaskStatus.ACQUIRED}
                />);
        }
        const addonAfter = deleting
            ? <DontChangeStatusButton
                key="delete"
                id={item.id}
                next={item._next_status}
            />
            : null;
        return <Item
            depth={depth}
            prefix={addonBefore}
            suffix={addonAfter}
            onClick={this.onClick}
            className={classnames({
                [classes.question]: question,
                [classes.active]: active,
                [classes.acquiring]: acquiring,
                [classes.needing]: needing,
                [classes.deleting]: deleting,
            })}
        >
            {active
                ? <Input
                    fullWidth
                    value={item.name}
                    placeholder="Write a task name"
                    disableUnderline
                    inputRef={this.inputRef}
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                />
                : <ListItemText
                    className={classes.text}
                    secondary={item.path.map(p => p.name).join(" / ")}
                >
                    {!item.ingredient
                        ? item.name
                        : <IngredientItem
                            ingRef={item}
                            hideRecipeLink
                            hideSendToPlan
                            inline
                        />}
                </ListItemText>}
        </Item>;
    }

}

TaskItem.propTypes = {
    ...tuplePropTypes,
    item: PropTypes.shape({
        ...itemPropTypes,
        depth: PropTypes.number.isRequired,
        question: PropTypes.bool.isRequired,
        path: PropTypes.arrayOf(PropTypes.shape(baseItemPropTypes)).isRequired,
    }).isRequired,
};

export default withItemStyles(TaskItem);
