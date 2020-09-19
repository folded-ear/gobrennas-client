const TaskStatus = {
    NEEDED: "NEEDED",
    ACQUIRED: "ACQUIRED",
    COMPLETED: "COMPLETED",
    DELETED: "DELETED",
};

export const willStatusDelete = status =>
    status === TaskStatus.COMPLETED || status === TaskStatus.DELETED;

export default TaskStatus;
