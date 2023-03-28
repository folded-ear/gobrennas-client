import { deepPurple } from "@mui/material/colors";
import {
    Check,
    DeleteForeverOutlined,
    QuestionAnswer,
} from "@mui/icons-material";
import {
    acquiredColor,
    completeColor,
    deleteColor,
    neededColor,
} from "views/common/colors";

enum TaskStatus {
    NEEDED = "NEEDED",
    ACQUIRED = "ACQUIRED",
    COMPLETED = "COMPLETED",
    DELETED = "DELETED",
}

export const willStatusDelete = status =>
    status === TaskStatus.COMPLETED || status === TaskStatus.DELETED;

const colorByStatus = {
    [TaskStatus.NEEDED]: neededColor,
    [TaskStatus.ACQUIRED]: acquiredColor,
    [TaskStatus.COMPLETED]: completeColor,
    [TaskStatus.DELETED]: deleteColor,
};
export const getColorForStatus = (status: TaskStatus) =>
    colorByStatus[status] || deepPurple;

const iconByStatus = {
    [TaskStatus.NEEDED]: Check,
    [TaskStatus.ACQUIRED]: Check,
    [TaskStatus.COMPLETED]: Check,
    [TaskStatus.DELETED]: DeleteForeverOutlined,
};
export const getIconForStatus = (status: TaskStatus) =>
    iconByStatus[status] || QuestionAnswer;

export default TaskStatus;
