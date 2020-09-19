import {
    acquiredColor,
    completeColor,
    deleteColor,
    neededColor,
} from "../views/common/colors";

const TaskStatus = {
    NEEDED: "NEEDED",
    ACQUIRED: "ACQUIRED",
    COMPLETED: "COMPLETED",
    DELETED: "DELETED",
};

export const willStatusDelete = status =>
    status === TaskStatus.COMPLETED || status === TaskStatus.DELETED;

export const colorByStatus = {
    [TaskStatus.NEEDED]: neededColor,
    [TaskStatus.ACQUIRED]: acquiredColor,
    [TaskStatus.COMPLETED]: completeColor,
    [TaskStatus.DELETED]: deleteColor,
};

export default TaskStatus;
