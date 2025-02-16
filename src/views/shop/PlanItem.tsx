import dispatcher, { ActionType } from "@/data/dispatcher";
import DontChangeStatusButton from "@/features/Planner/components/DontChangeStatusButton";
import Item from "@/features/Planner/components/Item";
import StatusIconButton from "@/features/Planner/components/StatusIconButton";
import withItemStyles from "@/features/Planner/components/withItemStyles";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import { isDoNotRecognize } from "@/features/Planner/data/plannerUtils";
import { ShopItemType } from "@/views/shop/ShopList";
import { ListItemText } from "@mui/material";
import Input from "@mui/material/Input";
import classnames from "classnames";
import * as React from "react";
import LoadingIconButton from "../common/LoadingIconButton";
import PlaceholderIconButton from "../common/PlaceholderIconButton";
import IngredientItem from "../IngredientItem";
import { BaseItemProp, ItemProps, TupleProps } from "./types";

type PlanItemProps = TupleProps & {
    depth: number;
    item: ItemProps & {
        question?: boolean;
        path: BaseItemProp[];
        ingredient?: any;
        _next_status?: any;
    };
};

class PlanItem extends React.PureComponent<PlanItemProps> {
    private inputRef: React.RefObject<HTMLInputElement>;

    constructor(props: PlanItemProps) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.inputRef = React.createRef<HTMLInputElement>();
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

    onClick(e: React.MouseEvent) {
        const { active, item } = this.props;
        if (active) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) return;
        dispatcher.dispatch({
            type: ActionType.SHOPPING__FOCUS_ITEM,
            id: item.id,
            itemType: ShopItemType.PLAN_ITEM,
        });
    }

    onKeyDown(e: React.KeyboardEvent) {
        const { value, selectionStart } = e.target as HTMLInputElement;
        const { key } = e;
        // eslint-disable-next-line default-case
        switch (key) {
            case "Enter":
                if (value.length === 0) break;
                // add a new item, before if the cursor is at the beginning, after otherwise
                dispatcher.dispatch({
                    type:
                        selectionStart === 0
                            ? ActionType.SHOPPING__CREATE_ITEM_BEFORE
                            : ActionType.SHOPPING__CREATE_ITEM_AFTER,
                    id: this.props.item.id,
                });
                break;
            case "Backspace":
                // if the value is empty, delete the item and focus previous
                if (value.length === 0) {
                    e.preventDefault();
                    dispatcher.dispatch({
                        type: ActionType.SHOPPING__DELETE_ITEM_BACKWARD,
                        id: this.props.item.id,
                    });
                }
                break;
            case "Delete":
                // if the value is empty, delete the item and focus next
                if (value.length === 0) {
                    e.preventDefault();
                    dispatcher.dispatch({
                        type: ActionType.SHOPPING__DELETE_ITEM_FORWARD,
                        id: this.props.item.id,
                    });
                }
                break;
        }
    }

    componentDidMount() {
        if (this.props.active && this.inputRef?.current)
            this.inputRef.current.focus();
    }

    componentDidUpdate() {
        if (this.props.active && this.inputRef?.current)
            this.inputRef.current.focus();
    }

    render() {
        const { item, depth, active, classes } = this.props;
        const { question, loading, deleting, acquiring } = item;
        const addonBefore = [
            <PlaceholderIconButton key="collapse" size="small" />,
        ];
        if (loading || deleting) {
            addonBefore.push(<LoadingIconButton key="acquire" />);
        } else {
            const curr = item._next_status || item.status;
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
        const addonAfter = deleting ? (
            <DontChangeStatusButton
                key="delete"
                id={item.id}
                next={item._next_status}
            />
        ) : null;
        return (
            <Item
                depth={depth}
                prefix={addonBefore}
                suffix={addonAfter}
                onClick={this.onClick}
                className={classnames({
                    [classes.question]: question,
                    [classes.active]: active,
                    [classes.acquiring]: acquiring,
                    [classes.deleting]: deleting,
                })}
            >
                {active ? (
                    <Input
                        fullWidth
                        value={item.name}
                        placeholder="Enter an item name"
                        disableUnderline
                        inputRef={this.inputRef}
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown}
                    />
                ) : (
                    <ListItemText
                        className={classes.text}
                        secondary={item.path.map((p) => p.name).join(" / ")}
                    >
                        {!item.ingredient ? (
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
