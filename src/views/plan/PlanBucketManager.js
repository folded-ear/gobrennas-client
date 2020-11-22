import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import TableCell from "@material-ui/core/TableCell";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import {
    Add as AddIcon,
    AddToPhotos as GenerateIcon,
    Delete as DeleteIcon,
} from "@material-ui/icons";
import { Container } from "flux/utils";
import PropTypes from "prop-types";
import React from "react";
import TaskStore, { bucketType } from "../../data/TaskStore";
import {
    formatLocalDate,
    parseLocalDate,
} from "../../util/time";

const getBucketLabel = b => {
    if (b.name) return b.name;
    if (!b.date) return `Bucket ${b.id}`;
    return new Intl.DateTimeFormat("default", {
        month: "short",
        weekday: "short",
        day: "numeric"
    }).format(b.date);
};

const BucketManager = ({
    buckets,
    onBucketCreate,
    onBucketGenerate,
    onBucketNameChange,
    onBucketDateChange,
    onBucketDelete,
}) => {
    return <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Label</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">
                        <Tooltip
                            title="Add a new bucket"
                            placement="bottom-end"
                        >
                            <IconButton
                                edge={onBucketGenerate ? false : "end"}
                                onClick={() => onBucketCreate()}
                                size="small"
                            >
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                        {onBucketGenerate &&
                            <Tooltip
                                title="Generate a week's buckets"
                                placement="bottom-end"
                            >
                                <IconButton
                                    edge="end"
                                    onClick={() => onBucketGenerate()}
                                    size="small"
                                >
                                    <GenerateIcon />
                                </IconButton>
                            </Tooltip>}
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {buckets.map(b =>
                    <TableRow key={b.id}>
                        <TableCell>
                            <TextField
                                value={b.name || ""}
                                onChange={e => onBucketNameChange(b.id, e.target.value)}
                                placeholder={getBucketLabel(b)}
                                size="small"
                            />
                        </TableCell>
                        <TableCell>
                            <TextField
                                value={formatLocalDate(b.date) || ""}
                                type="date"
                                onChange={e => onBucketDateChange(b.id, parseLocalDate(e.target.value), e.target.value)}
                                size="small"
                                inputProps={{
                                    style: {
                                        color: b.date ? "currentColor" : "#a3a3a3",
                                    },
                                }}
                            />
                        </TableCell>
                        <TableCell align="right">
                            <Tooltip
                                title="Delete this bucket"
                                placement="left"
                            >
                                <IconButton
                                    size="small"
                                    edge="end"
                                    onClick={() => onBucketDelete(b.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>)}
            </TableBody>
        </Table>
    </TableContainer>;
};

BucketManager.propTypes = {
    buckets: PropTypes.arrayOf(bucketType).isRequired,
    onBucketCreate: PropTypes.func.isRequired,
    onBucketGenerate: PropTypes.func,
    onBucketNameChange: PropTypes.func.isRequired,
    onBucketDateChange: PropTypes.func.isRequired,
    onBucketDelete: PropTypes.func.isRequired,
};

export default Container.createFunctional(
    props => <BucketManager {...props} />,
    () => [
        TaskStore,
    ],
    () => ({
        buckets: TaskStore.getActiveListLO()
            .getValueEnforcing()
            .buckets,
        onBucketCreate: () => console.log("onBucketCreate"),
        onBucketGenerate: () => console.log("onBucketGenerate"),
        onBucketNameChange: (id, value) => console.log("onBucketNameChange", id, value),
        onBucketDateChange: (id, value, rawValue) => console.log("onBucketDateChange", id, value, rawValue),
        onBucketDelete: (id) => console.log("onBucketDelete", id),
    }),
);
