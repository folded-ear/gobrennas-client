import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import TableCell from "@material-ui/core/TableCell";
import Tooltip from "@material-ui/core/Tooltip";
import {
    Add as AddIcon,
    AddToPhotos as GenerateIcon,
    Delete as DeleteIcon,
} from "@material-ui/icons";
import React from "react";
import dispatcher from "data/dispatcher";
import TaskActions from "features/Planner/data/TaskActions";
import TaskStore from "features/Planner/data/TaskStore";
import useFluxStore from "data/useFluxStore";
import {
    formatLocalDate,
    parseLocalDate,
} from "util/time";
import LocalTextField from "views/common/LocalTextField";
import getBucketLabel from "features/Planner/components/getBucketLabel";

const BucketManager = () => {
    const {
        buckets,
        onBucketCreate,
        onBucketGenerate,
        onBucketNameChange,
        onBucketDateChange,
        onBucketDelete,
    } = useFluxStore(
        () => {
            const plan = TaskStore.getActiveListLO()
                .getValueEnforcing();
            return {
                buckets: plan.buckets || [],
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
                    date: value,
                }),
                onBucketDelete: id => dispatcher.dispatch({
                    type: TaskActions.DELETE_BUCKET,
                    planId: plan.id,
                    id,
                }),
            };
        },
        [TaskStore],
    );

    return <TableContainer>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Bucket</TableCell>
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
                            <LocalTextField
                                value={b.name}
                                onChange={e => onBucketNameChange(b.id, e.target.value)}
                                placeholder={getBucketLabel(b)}
                                size="small"
                                style={{
                                    minWidth: "8em",
                                }}
                            />
                        </TableCell>
                        <TableCell>
                            <LocalTextField
                                type="date"
                                value={formatLocalDate(b.date)}
                                onChange={e => onBucketDateChange(b.id, parseLocalDate(e.target.value))}
                                size="small"
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

export default BucketManager;
