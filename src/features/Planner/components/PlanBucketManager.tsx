import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import Tooltip from "@mui/material/Tooltip";
import { AddIcon, DeleteIcon } from "@/views/common/icons";
import dispatcher from "@/data/dispatcher";
import PlanActions from "@/features/Planner/data/PlanActions";
import planStore from "@/features/Planner/data/planStore";
import useFluxStore from "@/data/useFluxStore";
import { formatLocalDate, parseLocalDate } from "@/util/time";
import LocalTextField from "@/views/common/LocalTextField";
import getBucketLabel from "@/features/Planner/components/getBucketLabel";
import ResetBucketsButton from "./ResetBucketsButton";

const BucketManager = () => {
    const {
        id: planId,
        buckets,
        onBucketCreate,
        onBucketNameChange,
        onBucketDateChange,
        onBucketDelete,
    } = useFluxStore(() => {
        const plan = planStore.getActivePlanRlo().data;
        if (!plan) throw new TypeError("Missing required plan");
        return {
            id: plan.id,
            buckets: plan.buckets || [],
            onBucketCreate: () =>
                dispatcher.dispatch({
                    type: PlanActions.CREATE_BUCKET,
                    planId: plan.id,
                }),
            onBucketNameChange: (id, value) =>
                dispatcher.dispatch({
                    type: PlanActions.RENAME_BUCKET,
                    planId: plan.id,
                    id,
                    name: value,
                }),
            onBucketDateChange: (id, value) =>
                dispatcher.dispatch({
                    type: PlanActions.SET_BUCKET_DATE,
                    planId: plan.id,
                    id,
                    date: value,
                }),
            onBucketDelete: (id) =>
                dispatcher.dispatch({
                    type: PlanActions.DELETE_BUCKET,
                    planId: plan.id,
                    id,
                }),
        };
    }, [planStore]);

    return (
        <TableContainer>
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
                                    edge="end"
                                    onClick={() => onBucketCreate()}
                                    size="small"
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                            <ResetBucketsButton planId={planId} edge="end" />
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {buckets.map((b) => (
                        <TableRow key={b.id}>
                            <TableCell>
                                <LocalTextField
                                    value={b.name}
                                    onChange={(e) =>
                                        onBucketNameChange(b.id, e.target.value)
                                    }
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
                                    value={formatLocalDate(b.date) || ""}
                                    onChange={(e) =>
                                        onBucketDateChange(
                                            b.id,
                                            parseLocalDate(e.target.value),
                                        )
                                    }
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
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default BucketManager;
