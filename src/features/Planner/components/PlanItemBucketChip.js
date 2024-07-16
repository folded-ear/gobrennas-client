import { ClearIcon, CookIcon } from "../../../views/common/icons";
import { Chip, Divider, Menu, MenuItem } from "@mui/material";
import dispatcher from "data/dispatcher";
import getBucketLabel from "features/Planner/components/getBucketLabel";
import PlanActions from "features/Planner/data/PlanActions";
import PropTypes from "prop-types";
import React from "react";
import { clientOrDatabaseIdType } from "util/ClientId";
import history from "util/history";
import { humanDate } from "util/time";
import ListItemIcon from "@mui/material/ListItemIcon";

const BucketChip = ({
    planId,
    bucketId,
    buckets = [],
    onSelect,
    onManage,
    offPlan,
}) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    if (buckets.length === 0) return null;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (bucketId) => {
        onSelect && onSelect(bucketId);
        setAnchorEl(null);
    };

    const handleManage = () => {
        onManage && onManage();
        setAnchorEl(null);
    };

    const chipProps = {};
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
        chipProps.label = label.substr(0, 3);
        chipProps.title = title;
    } else {
        chipProps.variant = "outlined";
        chipProps.title = "Click to assign a bucket";
    }

    return (
        <>
            <Chip
                size="small"
                color="secondary"
                onClick={handleClick}
                {...chipProps}
            />
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

BucketChip.propTypes = {
    planId: PropTypes.number.isRequired,
    bucketId: PropTypes.number,
    buckets: PropTypes.array.isRequired, // todo: PropTypes.arrayOf(bucketType).isRequired,
    onSelect: PropTypes.func.isRequired,
    onManage: PropTypes.func,
    offPlan: PropTypes.bool,
};

const PlanItemBucketChip = ({ itemId, ...props }) => (
    <BucketChip
        onSelect={(bucketId) =>
            dispatcher.dispatch({
                type: PlanActions.ASSIGN_ITEM_TO_BUCKET,
                id: itemId,
                bucketId,
            })
        }
        onManage={() =>
            dispatcher.dispatch({
                type: PlanActions.PLAN_DETAIL_VISIBILITY,
                visible: true,
            })
        }
        {...props}
    />
);

PlanItemBucketChip.propTypes = {
    planId: PropTypes.number.isRequired,
    itemId: clientOrDatabaseIdType.isRequired,
    bucketId: PropTypes.number,
    buckets: PropTypes.array.isRequired, // todo: PropTypes.arrayOf(bucketType).isRequired,
};

export default PlanItemBucketChip;
