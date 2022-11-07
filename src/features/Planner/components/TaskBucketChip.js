import {
    Chip,
    Divider,
} from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {
    HighlightOff as DeleteIcon,
    Kitchen,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import dispatcher from "data/dispatcher";
import TaskActions from "features/Planner/data/TaskActions";
import { bucketType } from "features/Planner/data/TaskStore";
import { clientOrDatabaseIdType } from "util/ClientId";
import history from "util/history";
import { humanDate } from "util/time";
import getBucketLabel from "features/Planner/components/getBucketLabel";

const BucketChip = ({
    planId,
    bucketId,
    buckets = [],
    onSelect,
    onManage,
}) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = bucketId => {
        onSelect && onSelect(bucketId);
        setAnchorEl(null);
    };

    const handleManage = () => {
        onManage && onManage();
        setAnchorEl(null);
    };

    const chipProps = {};
    const bucket = buckets.find(b => b.id === bucketId);
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
        chipProps.deleteIcon = <DeleteIcon opacity={0.4} />;
    } else {
        chipProps.variant = "outlined";
        chipProps.title = "Click to assign a bucket";
    }

    return <>
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
        >
            {bucket && <MenuItem
                onClick={() => history.push(`/plan/${planId}/bucket/${bucketId}`)}
            >
                <Kitchen />
                Cook &quot;{getBucketLabel(bucket)}&quot;
            </MenuItem>}
            {bucket && <Divider />}
            {buckets.map(b => {
                const selected = b === bucket;
                return <MenuItem
                    key={b.id}
                    selected={selected}
                    onClick={selected
                        ? handleClose
                        : () => handleSelect(b.id)}
                >
                    {getBucketLabel(b)}
                </MenuItem>;
            })}
            <Divider />
            <MenuItem
                onClick={bucket
                    ? () => handleSelect(null)
                    : handleClose}
                disabled={!bucket}
            >
                Clear
            </MenuItem>
            {onManage && <MenuItem
                onClick={handleManage}
            >
                Manage Buckets
            </MenuItem>}
        </Menu>
    </>;
};

BucketChip.propTypes = {
    planId: PropTypes.number.isRequired,
    bucketId: PropTypes.number,
    buckets: PropTypes.arrayOf(bucketType).isRequired,
    onSelect: PropTypes.func.isRequired,
    onManage: PropTypes.func,
};

const TaskBucketChip = ({
    taskId,
    ...props
}) =>
    <BucketChip
        onSelect={bucketId => dispatcher.dispatch({
            type: TaskActions.ASSIGN_ITEM_TO_BUCKET,
            id: taskId,
            bucketId,
        })}
        onManage={() => dispatcher.dispatch({
            type: TaskActions.LIST_DETAIL_VISIBILITY,
            visible: true,
        })}
        {...props}
    />;

TaskBucketChip.propTypes = {
    planId: PropTypes.number.isRequired,
    taskId: clientOrDatabaseIdType.isRequired,
    bucketId: PropTypes.number,
    buckets: PropTypes.arrayOf(bucketType).isRequired,
};

export default TaskBucketChip;
