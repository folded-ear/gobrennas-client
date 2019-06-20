const TaskActions = {
    // user actions (client-only)
    FOCUS: "task/focus",
    FOCUS_NEXT: "task/focus-next",
    FOCUS_PREVIOUS: "task/focus-previous",
    SELECT_LIST: "task/select-list",
    SELECT_NEXT: "task/select-next",
    SELECT_PREVIOUS: "task/select-previous",
    MULTI_LINE_PASTE: "task/multi-line-paste",
    // user actions (with persistence)
    CREATE_LIST: "task/create-list",
    DELETE_LIST: "task/delete-list",
    LIST_DETAIL_VISIBILITY: "task/list-detail-visibility",
    CREATE_TASK_AFTER: "task/create-task-after",
    CREATE_TASK_BEFORE: "task/create-task-before",
    DELETE_TASK: "task/delete-task",
    DELETE_TASK_BACKWARDS: "task/delete-task-backwards",
    DELETE_TASK_FORWARD: "task/delete-task-forward",
    MARK_COMPLETE: "task/mark-complete",
    MOVE_NEXT: "task/move-next",
    MOVE_PREVIOUS: "task/move-previous",
    RENAME_TASK: "task/rename-task",
    SET_LIST_GRANT: "task/set-list-grant",
    CLEAR_LIST_GRANT: "task/clear-list-grant",
    // ajax actions
    LOAD_LISTS: "task/load-lists",
    LISTS_LOADED: "task/lists-loaded",
    LIST_CREATED: "task/list-created",
    LIST_DELETED: "task/list-deleted",
    SUBTASKS_LOADED: "task/subtasks-loaded",
    TASK_CREATED: "task/task-created",
    TASK_RENAMED: "task/task-renamed",
    SUBTASKS_RESET: "task/subtasks-reset",
    TASK_DELETED: "task/task-deleted",
    TASK_COMPLETED: "task/task-completed",
    LIST_GRANT_SET: "task/list-grant-set",
    LIST_GRANT_CLEARED: "task/list-grant-cleared",
    // deferred actions
    FLUSH_RENAMES: "task/flush-renames",
    FLUSH_REORDERS: "task/flush-reorders",
};

export default TaskActions;
