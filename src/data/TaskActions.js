const TaskActions = {
    // user actions (client-only)
    FOCUS: "task/focus",
    FOCUS_NEXT: "task/focus-next",
    FOCUS_PREVIOUS: "task/focus-previous",
    SELECT_LIST: "task/select-list",
    SELECT_NEXT: "task/select-next",
    SELECT_PREVIOUS: "task/select-previous",
    // user actions (with persistence)
    CREATE_LIST: "task/create-list",
    CREATE_TASK_AFTER: "task/create-task-after",
    CREATE_TASK_BEFORE: "task/create-task-before",
    DELETE_TASK: "task/delete-task",
    DELETE_TASK_BACKWARDS: "task/delete-task-backwards",
    DELETE_TASK_FORWARD: "task/delete-task-forward",
    MARK_COMPLETE: "task/mark-complete",
    MOVE_NEXT: "task/move-next",
    MOVE_PREVIOUS: "task/move-previous",
    RENAME_TASK: "task/rename-task",
    // ajax actions
    LISTS_LOADED: "task/lists-loaded",
    LIST_CREATED: "task/list-created",
    SUBTASKS_LOADED: "task/subtasks-loaded",
    TASK_CREATED: "task/task-created",
    TASK_RENAMED: "task/task-renamed",
    SUBTASKS_UPDATED: "task/subtasks-updated",
    TASK_DELETED: "task/task-deleted",
    TASK_COMPLETED: "task/task-completed",
};

export default TaskActions;
