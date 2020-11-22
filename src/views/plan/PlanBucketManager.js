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
import dispatcher from "../../data/dispatcher";
import TaskActions from "../../data/TaskActions";
import TaskStore, { bucketType } from "../../data/TaskStore";
import getBucketLabel from "./getBucketLabel";

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
                                value={b.ds || ""}
                                type="date"
                                onChange={e => onBucketDateChange(b.id, e.target.value)}
                                size="small"
                                inputProps={{
                                    style: {
                                        color: b.ds ? "currentColor" : "#a3a3a3",
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
    () => {
        const plan = TaskStore.getActiveListLO()
            .getValueEnforcing();
        return {
            buckets: plan.buckets,
            onBucketCreate: () => dispatcher.dispatch({
                type: TaskActions.CREATE_BUCKET,
                planId: plan.id,
            }),
            onBucketGenerate: () => dispatcher.dispatch({
                type: TaskActions.GENERATE_ONE_WEEKS_BUCKETS,
                planId: plan.id,
            }),
            onBucketNameChange: (id, value) => dispatcher.dispatch({
                type: TaskActions.RENAME_BUCKET,
                planId: plan.id,
                id,
                name: value,
            }),
            onBucketDateChange: (id, value) => dispatcher.dispatch({
                type: TaskActions.SET_BUCKET_DATE,
                planId: plan.id,
                id,
                ds: value,
            }),
            onBucketDelete: id => dispatcher.dispatch({
                type: TaskActions.DELETE_BUCKET,
                planId: plan.id,
                id,
            }),
        };
    },
);
