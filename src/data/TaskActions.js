import PropTypes from "prop-types";
import { clientOrDatabaseIdType } from "../util/ClientId";
import typedAction from "../util/typedAction";

const TaskActions = {
    // user actions (client-only)
    FOCUS: "task/focus",
    FOCUS_NEXT: "task/focus-next",
    FOCUS_PREVIOUS: "task/focus-previous",
    SELECT_LIST: "task/select-list",
    SELECT_NEXT: "task/select-next",
    SELECT_PREVIOUS: "task/select-previous",
    SELECT_TO: "task/select-to",
    MULTI_LINE_PASTE: "task/multi-line-paste",
    TOGGLE_EXPANDED: "task/toggle-expanded",
    EXPAND_ALL: "task/expand-all",
    COLLAPSE_ALL: "task/collapse-all",
    // user actions (with persistence)
    CREATE_LIST: "task/create-list",
    RENAME_LIST: "task/rename-list",
    DELETE_LIST: "task/delete-list",
    LIST_DETAIL_VISIBILITY: "task/list-detail-visibility",
    CREATE_TASK_AFTER: "task/create-task-after",
    CREATE_TASK_BEFORE: "task/create-task-before",
    DELETE_TASK_BACKWARDS: "task/delete-task-backwards",
    DELETE_TASK_FORWARD: "task/delete-task-forward",
    SET_STATUS: typedAction("task/set-status", {
        id: clientOrDatabaseIdType.isRequired,
        status: PropTypes.string.isRequired,
        focusDelta: PropTypes.number, // maybe?
    }),
    UNDO_SET_STATUS: "task/undo-set-status",
    MOVE_NEXT: "task/move-next",
    MOVE_PREVIOUS: "task/move-previous",
    RENAME_TASK: "task/rename-task",
    SET_LIST_GRANT: "task/set-list-grant",
    CLEAR_LIST_GRANT: "task/clear-list-grant",
    NEST: "task/nest",
    UNNEST: "task/unnest",
    // ajax actions
    LOAD_LISTS: "task/load-lists",
    LISTS_LOADED: "task/lists-loaded",
    LIST_CREATED: "task/list-created",
    LIST_DELETED: "task/list-deleted",
    SUBTASKS_LOADED: "task/subtasks-loaded",
    TASK_CREATED: "task/task-created",
    TASK_RENAMED: "task/task-renamed",
    SUBTASKS_RESET: "task/subtasks-reset",
    PARENT_RESET: "task/parent-reset",
    TASK_DELETED: "task/deleted",
    STATUS_UPDATED: "task/status-updated",
    LIST_GRANT_SET: "task/list-grant-set",
    LIST_GRANT_CLEARED: "task/list-grant-cleared",
    // deferred actions
    FLUSH_RENAMES: "task/flush-renames",
    FLUSH_REORDERS: "task/flush-reorders",
    FLUSH_DELETES: "task/flush-deletes",
    DELETE_SELECTED: "task/delete-selected",
};

export default TaskActions;
