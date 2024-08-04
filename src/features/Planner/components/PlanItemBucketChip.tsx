import { ClearIcon, CookIcon } from "../../../views/common/icons";
import { Chip, ChipProps, Divider, Menu, MenuItem } from "@mui/material";
import dispatcher from "data/dispatcher";
import getBucketLabel from "features/Planner/components/getBucketLabel";
import PlanActions from "features/Planner/data/PlanActions";
import React from "react";
import history from "util/history";
import { humanDate } from "util/time";
import ListItemIcon from "@mui/material/ListItemIcon";
import { BfsId } from "../../../global/types/identity";
import { Maybe } from "graphql/jsutils/Maybe";
import { PlanBucket } from "../data/planStore";

interface BucketChipProps {
    planId: BfsId;
    bucketId: Maybe<BfsId>;
    buckets: PlanBucket[];
    onSelect(bucketId: Maybe<BfsId>): void;
    onManage?: () => void;
    offPlan: boolean;
    size: ChipProps["size"];
}

const BucketChip: React.FC<BucketChipProps> = ({
    planId,
    bucketId,
    buckets = [],
    onSelect,
    onManage,
    offPlan,
    size = "small",
}) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    if (buckets.length === 0) return null;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (bucketId: Maybe<BfsId>) => {
        onSelect && onSelect(bucketId);
        setAnchorEl(null);
    };

    const handleManage = () => {
        onManage && onManage();
        setAnchorEl(null);
    };

    const chipProps: ChipProps = { size };
    const bucket = buckets.find((b) => b.id === bucketId);
    if (bucket) {
        const label = getBucketLabel(bucket);
        let title = label;
        if (bucket.date != null) {
            const dateLabel = humanDate(bucket.date);
            if (label !== dateLabel) {
                title += ` (${dateLabel})`;
            }
        }
        chipProps.label = label.slice(0, 3);
        chipProps.title = title;
    } else {
        chipProps.variant = "outlined";
        chipProps.title = "Click to assign a bucket";
    }

    return (
        <>
            <Chip color="neutral" onClick={handleClick} {...chipProps} />
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                MenuListProps={{
                    dense: true,
                }}
            >
                {bucket && !offPlan && (
                    <MenuItem
                        onClick={() =>
                            history.push(`/plan/${planId}/bucket/${bucketId}`)
                        }
                    >
                        <ListItemIcon>
                            <CookIcon />
                        </ListItemIcon>
                        Cook &quot;{getBucketLabel(bucket)}&quot;
                    </MenuItem>
                )}
                {bucket && !offPlan && <Divider />}
                {buckets.map((b) => {
                    const selected = b === bucket;
                    return (
                        <MenuItem
                            key={b.id}
                            selected={selected}
                            onClick={
                                selected
                                    ? handleClose
                                    : () => handleSelect(b.id)
                            }
                        >
                            <ListItemIcon />
                            {getBucketLabel(b)}
                        </MenuItem>
                    );
                })}
                <Divider />
                <MenuItem
                    onClick={bucket ? () => handleSelect(null) : handleClose}
                    disabled={!bucket}
                >
                    <ListItemIcon>
                        <ClearIcon />
                    </ListItemIcon>
                    Clear
                </MenuItem>
                {onManage && !offPlan && (
                    <MenuItem onClick={handleManage}>
                        <ListItemIcon />
                        Manage Buckets
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};

export function assignItemToBucket(itemId: BfsId, bucketId: Maybe<BfsId>) {
    dispatcher.dispatch({
        type: PlanActions.ASSIGN_ITEM_TO_BUCKET,
        id: itemId,
        bucketId,
    });
}

interface PlanItemBucketChipProps
    extends Omit<BucketChipProps, "onSelect" | "onManage"> {
    itemId: BfsId;
}

const PlanItemBucketChip: React.FC<PlanItemBucketChipProps> = ({
    itemId,
    ...props
}) => (
    <BucketChip
        onSelect={(bucketId) => assignItemToBucket(itemId, bucketId)}
        onManage={() =>
            dispatcher.dispatch({
                type: PlanActions.PLAN_DETAIL_VISIBILITY,
                visible: true,
            })
        }
        {...props}
    />
);

export default PlanItemBucketChip;
