import dispatcher, { ActionType } from "@/data/dispatcher";
import CookButton from "@/features/Planner/components/CookButton";
import DontChangeStatusButton from "@/features/Planner/components/DontChangeStatusButton";
import Item from "@/features/Planner/components/Item";
import PlanItemBucketChip from "@/features/Planner/components/PlanItemBucketChip";
import StatusIconButton from "@/features/Planner/components/StatusIconButton";
import withItemStyles, {
    ItemStyles,
} from "@/features/Planner/components/withItemStyles";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import {
    isDoNotRecognize,
    isExpanded,
    isParent,
    isQuestionable,
    isSection,
} from "@/features/Planner/data/plannerUtils";
import planStore, { Plan, PlanBucket } from "@/features/Planner/data/planStore";
import { ItemData } from "@/features/Planner/PlannerController";
import CollapseIconButton from "@/global/components/CollapseIconButton";
import LoadingIconButton from "@/views/common/LoadingIconButton";
import PlaceholderIconButton from "@/views/common/PlaceholderIconButton";
import IngredientItem from "@/views/IngredientItem";
import { ListItemText } from "@mui/material";
import Input from "@mui/material/Input";
import classnames from "classnames";
import * as React from "react";
import { createRef, PureComponent, ReactNode, RefObject } from "react";

interface Props {
    depth: number;
    plan: Plan;
    item: ItemData;
    loading?: boolean | undefined;
    active?: boolean | undefined;
    selected?: boolean | undefined;
    buckets?: PlanBucket[];
    ancestorDeleting?: boolean | undefined;
    classes: ItemStyles;
}

class PlanItem extends PureComponent<Props> {
    private readonly inputRef: RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onToggleExpanded = this.onToggleExpanded.bind(this);
        this.inputRef = createRef();
    }

    onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { value } = e.target;
        const { item } = this.props;
        dispatcher.dispatch({
            type: ActionType.PLAN__RENAME_ITEM,
            id: item.id,
            name: value,
        });
    }

    onCopy(e: React.ClipboardEvent) {
        if (!planStore.isMultiItemSelection()) return;
        e.preventDefault();
        const text = planStore.getSelectionAsTextBlock();
        e.clipboardData.setData("text", text);
    }

    onPaste(e: React.ClipboardEvent) {
        let text = e.clipboardData.getData("text");
        if (text == null) return;
        text = text.trim();
        if (text.indexOf("\n") < 0) return;
        // it's multi-line!
        e.preventDefault();
        dispatcher.dispatch({
            type: ActionType.PLAN__MULTI_LINE_PASTE,
            text,
        });
    }

    onKeyDown(e: React.KeyboardEvent) {
        const { value, selectionStart } = e.target as HTMLInputElement;
        const { key, ctrlKey, shiftKey } = e;
        switch (key) {
            case "Enter":
                if (value.length === 0) break;
                // add a new item, before if the cursor is at the beginning, after otherwise
                dispatcher.dispatch({
                    type:
                        selectionStart === 0
                            ? ActionType.PLAN__CREATE_ITEM_BEFORE
                            : ActionType.PLAN__CREATE_ITEM_AFTER,
                    id: this.props.item.id,
                });
                break;
            case "Backspace":
                // if the value is empty, delete the item and focus previous
                if (value.length === 0) {
                    e.preventDefault();
                    dispatcher.dispatch({
                        type: ActionType.PLAN__DELETE_ITEM_BACKWARDS,
                        id: this.props.item.id,
                    });
                } else if (shiftKey) {
                    e.preventDefault();
                    dispatcher.dispatch({
                        type: ActionType.PLAN__DELETE_SELECTED,
                    });
                }
                break;
            case "Delete":
                // if the value is empty, delete the item and focus next
                if (value.length === 0) {
                    e.preventDefault();
                    dispatcher.dispatch({
                        type: ActionType.PLAN__DELETE_ITEM_FORWARD,
                        id: this.props.item.id,
                    });
                } else if (shiftKey) {
                    e.preventDefault();
                    dispatcher.dispatch({
                        type: ActionType.PLAN__DELETE_SELECTED,
                    });
                }
                break;
            case "Tab":
                e.preventDefault();
                dispatcher.dispatch({
                    type: shiftKey
                        ? ActionType.PLAN__UNNEST
                        : ActionType.PLAN__NEST,
                });
                break;
            case "ArrowUp":
                e.preventDefault();
                if (shiftKey && ctrlKey) break;
                if (shiftKey) {
                    // select this item and the previous one
                    dispatcher.dispatch({
                        type: ActionType.PLAN__SELECT_PREVIOUS,
                    });
                } else if (ctrlKey) {
                    // move all selected items up one (if a predecessor exists)
                    dispatcher.dispatch({
                        type: ActionType.PLAN__MOVE_PREVIOUS,
                    });
                } else {
                    dispatcher.dispatch({
                        type: ActionType.PLAN__FOCUS_PREVIOUS,
                    });
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                if (shiftKey && ctrlKey) break;
                if (shiftKey) {
                    // select this item and the next one
                    dispatcher.dispatch({
                        type: ActionType.PLAN__SELECT_NEXT,
                    });
                } else if (ctrlKey) {
                    // move all selected items down one (if a follower exists)
                    dispatcher.dispatch({
                        type: ActionType.PLAN__MOVE_NEXT,
                    });
                } else {
                    dispatcher.dispatch({
                        type: ActionType.PLAN__FOCUS_NEXT,
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

    onClick(e: React.MouseEvent) {
        const { active, item } = this.props;
        if (active) return;
        e.preventDefault();
        e.stopPropagation();
        dispatcher.dispatch({
            type: e.shiftKey
                ? ActionType.PLAN__SELECT_TO
                : ActionType.PLAN__FOCUS,
            id: item.id,
        });
    }

    onToggleExpanded(e?: React.MouseEvent) {
        if (e) e.stopPropagation();
        dispatcher.dispatch({
            type: ActionType.PLAN__TOGGLE_EXPANDED,
            id: this.props.item.id,
        });
    }

    componentDidMount() {
        if (this.props.active) this.inputRef.current?.focus();
    }

    componentDidUpdate() {
        if (this.props.active) this.inputRef.current?.focus();
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

        const addonBefore: ReactNode[] = [];
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
                    next={item._next_status!}
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
                        onDoubleClick={
                            parent ? this.onToggleExpanded : undefined
                        }
                    />
                ) : (
                    <ListItemText
                        className={classes.text}
                        onDoubleClick={
                            parent ? this.onToggleExpanded : undefined
                        }
                    >
                        {recipeIsh || !item.ingredient || section ? (
                            isDoNotRecognize(item) ? (
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

export default withItemStyles(PlanItem);
