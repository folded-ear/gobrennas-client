import PropTypes from "prop-types";
import { clientOrDatabaseIdType } from "util/ClientId";
import typedAction from "util/typedAction";

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
    SORT_BY_BUCKET: "task/sort-by-bucket",
    // user actions (with persistence)
    CREATE_LIST: "task/create-list",
    DUPLICATE_LIST: "task/duplicate-list",
    RENAME_LIST: typedAction("task/rename-list", {
        id: clientOrDatabaseIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
    DELETE_LIST: "task/delete-list",
    LIST_DETAIL_VISIBILITY: "task/list-detail-visibility",
    CREATE_TASK_AFTER: "task/create-task-after",
    CREATE_TASK_BEFORE: "task/create-task-before",
    CREATE_TASK_AT_END: "task/create-task-at-end",
    SEND_TO_PLAN: typedAction("task/send-to-plan", {
        planId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
    }),
    DELETE_TASK_BACKWARDS: "task/delete-task-backwards",
    DELETE_TASK_FORWARD: "task/delete-task-forward",
    DELETE_SELECTED: "task/delete-selected",
    SET_STATUS: typedAction("task/set-status", {
        id: clientOrDatabaseIdType.isRequired,
        status: PropTypes.string.isRequired,
    }),
    BULK_SET_STATUS: typedAction("task/bulk-set-status", {
        ids: PropTypes.arrayOf(clientOrDatabaseIdType).isRequired,
        status: PropTypes.string.isRequired,
    }),
    UNDO_SET_STATUS: "task/undo-set-status",
    MOVE_NEXT: "task/move-next",
    MOVE_PREVIOUS: "task/move-previous",
    RENAME_TASK: typedAction("task/rename-task", {
        id: clientOrDatabaseIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
    SET_LIST_GRANT: "task/set-list-grant",
    CLEAR_LIST_GRANT: "task/clear-list-grant",
    NEST: "task/nest",
    UNNEST: "task/unnest",
    MOVE_SUBTREE: "task/move-subtree",
    CREATE_BUCKET: typedAction("task/create-bucket", {
        planId: clientOrDatabaseIdType.isRequired,
    }),
    GENERATE_ONE_WEEKS_BUCKETS: typedAction("task/generate-one-weeks-buckets", {
        planId: clientOrDatabaseIdType.isRequired,
    }),
    RENAME_BUCKET: typedAction("task/rename-bucket", {
        planId: clientOrDatabaseIdType.isRequired,
        id: clientOrDatabaseIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
    SET_BUCKET_DATE: typedAction("task/set-bucket-date", {
        planId: clientOrDatabaseIdType.isRequired,
        id: clientOrDatabaseIdType.isRequired,
        date: PropTypes.instanceOf(Date), // can be null
    }),
    DELETE_BUCKET: typedAction("task/delete-bucket", {
        planId: clientOrDatabaseIdType.isRequired,
        id: clientOrDatabaseIdType.isRequired,
    }),
    BUCKET_CREATED: typedAction("task/bucket-created", {
        planId: PropTypes.number.isRequired,
        data: PropTypes.object.isRequired,
        oldId: clientOrDatabaseIdType.isRequired,
    }),
    BUCKET_UPDATED: typedAction("task/bucket-updated", {
        planId: PropTypes.number.isRequired,
        data: PropTypes.object.isRequired,
    }),
    BUCKET_DELETED: typedAction("task/bucket-deleted", {
        planId: PropTypes.number.isRequired,
        id: PropTypes.number.isRequired,
    }),
    ASSIGN_ITEM_TO_BUCKET: typedAction("task/assign-item-to-bucket", {
        id: PropTypes.number.isRequired,
        bucketId: PropTypes.number,
    }),
    // ajax actions
    LOAD_LISTS: "task/load-lists",
    LISTS_LOADED: "task/lists-loaded",
    LIST_CREATED: "task/list-created",
    LIST_DELETED: "task/list-deleted",
    LIST_GRANT_SET: "task/list-grant-set",
    LIST_GRANT_CLEARED: "task/list-grant-cleared",
    LIST_DELTAS: "task/list-deltas",
    TREE_CREATE: "task/tree-create",
    UPDATED: "task/updated",
    DELETED: "task/deleted",
    // socket actions
    LIST_DATA_BOOTSTRAPPED: "task/list-data-bootstrapped",
    // deferred actions
    FLUSH_RENAMES: "task/flush-renames",
    FLUSH_STATUS_UPDATES: "task/flush-status-updates",
};

export default TaskActions;
