import { ListItemText } from "@mui/material";
import classnames from "classnames";
import React from "react";
import dispatcher, { ActionType } from "@/data/dispatcher";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import LoadingIconButton from "../common/LoadingIconButton";
import OxfordList from "../common/OxfordList";
import Quantity from "../common/Quantity";
import CollapseIconButton from "@/global/components/CollapseIconButton";
import DontChangeStatusButton from "@/features/Planner/components/DontChangeStatusButton";
import Item from "@/features/Planner/components/Item";
import StatusIconButton from "@/features/Planner/components/StatusIconButton";
import withItemStyles from "@/features/Planner/components/withItemStyles";
import { BaseItemProp, ItemProps, TupleProps } from "./types";
import { ShopItemType } from "@/views/shop/ShopList";
import ListItemIcon from "@mui/material/ListItemIcon";
import { UnknownLocation } from "@/views/common/icons";
import { BfsStringId } from "@/global/types/identity";
import { Quantity as TQuantity } from "@/global/types/types";

type IngredientItemProps = TupleProps & {
    item: ItemProps &
        BaseItemProp & {
            expanded?: boolean;
            itemIds: BfsStringId[];
            storeOrder?: number;
            quantities: TQuantity[];
        };
};

class IngredientItem extends React.PureComponent<IngredientItemProps> {
    constructor(props: IngredientItemProps) {
        super(props);
        this.onSetStatus = this.onSetStatus.bind(this);
        this.onUndoSetStatus = this.onUndoSetStatus.bind(this);
        this.onToggleExpanded = this.onToggleExpanded.bind(this);
        this.onClick = this.onClick.bind(this);
    }

    onSetStatus(status: PlanItemStatus, e: React.MouseEvent) {
        e.stopPropagation();
        const {
            item: { id, itemIds },
        } = this.props;
        dispatcher.dispatch({
            type: ActionType.SHOPPING__SET_INGREDIENT_STATUS,
            id,
            itemIds,
            status,
        });
    }

    onUndoSetStatus(e: React.MouseEvent) {
        e.stopPropagation();
        const {
            item: { id, itemIds },
        } = this.props;
        dispatcher.dispatch({
            type: ActionType.SHOPPING__UNDO_SET_INGREDIENT_STATUS,
            id,
            itemIds,
        });
    }

    onToggleExpanded(e: React.MouseEvent) {
        e.stopPropagation();
        dispatcher.dispatch({
            type: ActionType.SHOPPING__TOGGLE_EXPANDED,
            id: this.props.item.id,
        });
    }

    onClick(e: React.MouseEvent) {
        const { item } = this.props;
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) return;
        dispatcher.dispatch({
            type: ActionType.SHOPPING__FOCUS_ITEM,
            id: item.id,
            itemType: ShopItemType.INGREDIENT,
        });
    }

    render() {
        const { item, active, classes } = this.props;
        const { expanded, loading, deleting, acquiring } = item;
        const addonBefore = [
            <CollapseIconButton
                key="collapse"
                expanded={expanded}
                onClick={this.onToggleExpanded}
            />,
        ];
        if (loading) {
            addonBefore.push(<LoadingIconButton key="acquire" />);
        } else {
            const next = acquiring
                ? PlanItemStatus.NEEDED
                : PlanItemStatus.ACQUIRED;
            addonBefore.push(
                <StatusIconButton
                    key="acquire"
                    current={
                        acquiring
                            ? PlanItemStatus.ACQUIRED
                            : PlanItemStatus.NEEDED
                    }
                    next={next}
                    onClick={(e) => this.onSetStatus(next, e)}
                />,
            );
        }
        const addonAfter = deleting ? (
            <DontChangeStatusButton
                key="delete"
                next={PlanItemStatus.DELETED}
                onClick={(e) => this.onUndoSetStatus(e)}
            />
        ) : null;
        return (
            <Item
                prefix={addonBefore}
                suffix={addonAfter}
                selected={active}
                onClick={this.onClick}
                className={classnames({
                    [classes.acquiring]: acquiring,
                    [classes.deleting]: deleting,
                })}
                dragId={item.id}
            >
                <ListItemText>
                    {item.name}
                    <OxfordList prefix=" (" suffix=")">
                        {item.quantities.map((q) => (
                            <Quantity
                                key={q.uomId || "count"}
                                quantity={q.quantity}
                                units={q.units}
                            />
                        ))}
                    </OxfordList>
                </ListItemText>
                {item.storeOrder === 0 && (
                    <ListItemIcon
                        title={"Where in the shopping order should this go?"}
                    >
                        <UnknownLocation />
                    </ListItemIcon>
                )}
            </Item>
        );
    }
}

export default withItemStyles(IngredientItem);
