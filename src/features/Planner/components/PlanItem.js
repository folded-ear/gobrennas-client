import { ListItemText } from "@mui/material";
import Input from "@mui/material/Input";
import classnames from "classnames";
import Dispatcher from "data/dispatcher";
import CookButton from "features/Planner/components/CookButton";
import DontChangeStatusButton from "features/Planner/components/DontChangeStatusButton";
import Item from "features/Planner/components/Item";
import PlanItemBucketChip from "features/Planner/components/PlanItemBucketChip";
import StatusIconButton from "features/Planner/components/StatusIconButton";
import withItemStyles from "features/Planner/components/withItemStyles";
import PlanActions from "features/Planner/data/PlanActions";
import PlanItemStatus from "features/Planner/data/PlanItemStatus";
import {
    isExpanded,
    isParent,
    isQuestionable,
    isSection,
} from "features/Planner/data/plannerUtils";
import planStore from "features/Planner/data/planStore";
import CollapseIconButton from "global/components/CollapseIconButton";
import PropTypes from "prop-types";
import React from "react";
import LoadingIconButton from "views/common/LoadingIconButton";
import PlaceholderIconButton from "views/common/PlaceholderIconButton";
import IngredientItem from "views/IngredientItem";

class PlanItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onToggleExpanded = this.onToggleExpanded.bind(this);
        this.inputRef = React.createRef();
    }

    onChange(e) {
        const { value } = e.target;
        const { item } = this.props;
        Dispatcher.dispatch({
            type: PlanActions.RENAME_ITEM,
            id: item.id,
            name: value,
        });
    }

    onCopy(e) {
        if (!planStore.isMultiItemSelection()) return;
        e.preventDefault();
        const text = planStore.getSelectionAsTextBlock();
        e.clipboardData.setData("text", text);
    }

    onPaste(e) {
        let text = e.clipboardData.getData("text");
        if (text == null) return;
        text = text.trim();
        if (text.indexOf("\n") < 0) return;
        // it's multi-line!
        e.preventDefault();
        Dispatcher.dispatch({
            type: PlanActions.MULTI_LINE_PASTE,
            text,
        });
    }

    onKeyDown(e) {
        const { value, selectionStart } = e.target;
        const { key, ctrlKey, shiftKey } = e;
        // eslint-disable-next-line default-case
        switch (key) {
            case "Enter":
                if (value.length === 0) break;
                // add a new item, before if the cursor is at the beginning, after otherwise
                Dispatcher.dispatch({
                    type:
                        selectionStart === 0
                            ? PlanActions.CREATE_ITEM_BEFORE
                            : PlanActions.CREATE_ITEM_AFTER,
                    id: this.props.item.id,
                });
                break;
            case "Backspace":
                // if the value is empty, delete the item and focus previous
                if (value.length === 0) {
                    e.preventDefault();
                    Dispatcher.dispatch({
                        type: PlanActions.DELETE_ITEM_BACKWARDS,
                        id: this.props.item.id,
                    });
                } else if (shiftKey) {
                    e.preventDefault();
                    Dispatcher.dispatch({
                        type: PlanActions.DELETE_SELECTED,
                    });
                }
                break;
            case "Delete":
                // if the value is empty, delete the item and focus next
                if (value.length === 0) {
                    e.preventDefault();
                    Dispatcher.dispatch({
                        type: PlanActions.DELETE_ITEM_FORWARD,
                        id: this.props.item.id,
                    });
                } else if (shiftKey) {
                    e.preventDefault();
                    Dispatcher.dispatch({
                        type: PlanActions.DELETE_SELECTED,
                    });
                }
                break;
            case "Tab":
                e.preventDefault();
                Dispatcher.dispatch({
                    type: shiftKey ? PlanActions.UNNEST : PlanActions.NEST,
                    id: this.props.item.id,
                });
                break;
            case "ArrowUp":
                e.preventDefault();
                if (shiftKey && ctrlKey) break;
                if (shiftKey) {
                    // select this item and the previous one
                    Dispatcher.dispatch({
                        type: PlanActions.SELECT_PREVIOUS,
                    });
                } else if (ctrlKey) {
                    // move all selected items up one (if a predecessor exists)
                    Dispatcher.dispatch({
                        type: PlanActions.MOVE_PREVIOUS,
                    });
                } else {
                    Dispatcher.dispatch({
                        type: PlanActions.FOCUS_PREVIOUS,
                    });
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                if (shiftKey && ctrlKey) break;
                if (shiftKey) {
                    // select this item and the next one
                    Dispatcher.dispatch({
                        type: PlanActions.SELECT_NEXT,
                    });
                } else if (ctrlKey) {
                    // move all selected items down one (if a follower exists)
                    Dispatcher.dispatch({
                        type: PlanActions.MOVE_NEXT,
                    });
                } else {
                    Dispatcher.dispatch({
                        type: PlanActions.FOCUS_NEXT,
                    });
                }
                break;
            case ".":
                if (ctrlKey) {
                    this.onToggleExpanded();
                }
                break;
        }
    }

    onClick(e) {
        const { active, item } = this.props;
        if (active) return;
        e.preventDefault();
        e.stopPropagation();
        Dispatcher.dispatch({
            type: e.shiftKey ? PlanActions.SELECT_TO : PlanActions.FOCUS,
            id: item.id,
        });
    }

    onToggleExpanded(e) {
        if (e) e.stopPropagation();
        Dispatcher.dispatch({
            type: PlanActions.TOGGLE_EXPANDED,
            id: this.props.item.id,
        });
    }

    componentDidMount() {
        if (this.props.active) this.inputRef.current.focus();
    }

    componentDidUpdate() {
        if (this.props.active) this.inputRef.current.focus();
    }

    render() {
        const {
            plan,
            item,
            depth,
            loading,
            active,
            selected,
            buckets,
            ancestorDeleting,
            classes,
        } = this.props;
        const section = isSection(item);
        const parent = isParent(item);
        const expanded = isExpanded(item);
        const recipeIsh = parent || item.fromRecipe;
        const question = isQuestionable(item);
        const completing = item._next_status === PlanItemStatus.COMPLETED;
        const deleting = item._next_status === PlanItemStatus.DELETED;
        const acquiring = item._next_status === PlanItemStatus.ACQUIRED;
        const needing = item._next_status === PlanItemStatus.NEEDED;

        let addonBefore = [];
        if (parent) {
            addonBefore.push(
                <CollapseIconButton
                    key="collapse"
                    expanded={expanded}
                    onClick={this.onToggleExpanded}
                />,
            );
        } else {
            addonBefore.push(
                <PlaceholderIconButton key="collapse" size="small" />,
            );
        }
        const curr = item._next_status || item.status;
        if (loading || completing || deleting || ancestorDeleting) {
            addonBefore.push(<LoadingIconButton key="acquire" />);
        } else if (section) {
            addonBefore.push(
                <PlaceholderIconButton key="acquire" size="small" />,
            );
        } else {
            addonBefore.push(
                <StatusIconButton
                    key="acquire"
                    id={item.id}
                    current={curr}
                    next={
                        curr === PlanItemStatus.ACQUIRED
                            ? PlanItemStatus.NEEDED
                            : PlanItemStatus.ACQUIRED
                    }
                />,
            );
        }
        const addonAfter = [
            (completing || deleting) && !ancestorDeleting ? (
                <DontChangeStatusButton
                    key="delete"
                    id={item.id}
                    next={item._next_status}
                />
            ) : (
                <StatusIconButton
                    key="delete"
                    id={item.id}
                    next={
                        curr === PlanItemStatus.DELETED
                            ? PlanItemStatus.NEEDED
                            : PlanItemStatus.DELETED
                    }
                    disabled={ancestorDeleting}
                />
            ),
        ];
        if (recipeIsh && !(completing || deleting)) {
            addonAfter.unshift(
                <CookButton
                    key="cook"
                    size="small"
                    planId={plan.id}
                    itemId={item.id}
                />,
            );
        }
        if (buckets && buckets.length > 0 && !(completing || deleting)) {
            addonAfter.unshift(
                <PlanItemBucketChip
                    key="bucket"
                    planId={plan.id}
                    itemId={item.id}
                    bucketId={item.bucketId}
                    buckets={buckets}
                />,
            );
        }

        return (
            <Item
                depth={depth}
                prefix={addonBefore}
                suffix={addonAfter}
                onClick={this.onClick}
                className={classnames({
                    [classes.section]: section,
                    [classes.active]: active,
                    [classes.selected]: selected,
                    [classes.question]: question,
                    [classes.completing]: completing,
                    [classes.deleting]: deleting,
                    [classes.acquiring]: acquiring,
                    [classes.needing]: needing,
                    [classes.ancestorDeleting]: ancestorDeleting,
                })}
                dragId={item.id}
            >
                {active ? (
                    <Input
                        fullWidth
                        value={item.name}
                        placeholder="Enter an item name"
                        disableUnderline
                        inputRef={this.inputRef}
                        onChange={this.onChange}
                        onPaste={this.onPaste}
                        onCopy={this.onCopy}
                        onKeyDown={this.onKeyDown}
                        onDoubleClick={parent ? this.onToggleExpanded : null}
                    />
                ) : (
                    <ListItemText
                        className={classes.text}
                        onDoubleClick={parent ? this.onToggleExpanded : null}
                    >
                        {recipeIsh || !item.ingredient || section ? (
                            item.name.length && item.name[0] === "!" ? (
                                item.name.substring(1)
                            ) : (
                                item.name
                            )
                        ) : (
                            <IngredientItem
                                ingRef={item}
                                hideRecipeLink
                                hideSendToPlan
                                inline
                            />
                        )}
                    </ListItemText>
                )}
            </Item>
        );
    }
}

PlanItem.propTypes = {
    depth: PropTypes.number.isRequired,
    plan: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    active: PropTypes.bool,
    selected: PropTypes.bool,
    buckets: PropTypes.array, // todo: PropTypes.arrayOf(bucketType),
    ancestorDeleting: PropTypes.bool,
    classes: PropTypes.object.isRequired,
};

export default withItemStyles(PlanItem);
