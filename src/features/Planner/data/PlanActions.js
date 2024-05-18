import PropTypes from "prop-types";
import { clientOrDatabaseIdType } from "util/ClientId";
import typedAction from "util/typedAction";

const PlanActions = {
    // user actions (client-only)
    FOCUS: "plan/focus",
    FOCUS_NEXT: "plan/focus-next",
    FOCUS_PREVIOUS: "plan/focus-previous",
    SELECT_PLAN: typedAction("plan/select-plan", {
        id: PropTypes.number.isRequired,
    }),
    SELECT_NEXT: "plan/select-next",
    SELECT_PREVIOUS: "plan/select-previous",
    SELECT_TO: "plan/select-to",
    MULTI_LINE_PASTE: "plan/multi-line-paste",
    TOGGLE_EXPANDED: "plan/toggle-expanded",
    EXPAND_ALL: "plan/expand-all",
    COLLAPSE_ALL: "plan/collapse-all",
    SORT_BY_BUCKET: "plan/sort-by-bucket",
    // user actions (with persistence)
    CREATE_PLAN: "plan/create-plan",
    DUPLICATE_PLAN: "plan/duplicate-plan",
    RENAME_PLAN: typedAction("plan/rename-plan", {
        id: clientOrDatabaseIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
    DELETE_PLAN: "plan/delete-plan",
    PLAN_DETAIL_VISIBILITY: "plan/plan-detail-visibility",
    CREATE_ITEM_AFTER: "plan/create-item-after",
    CREATE_ITEM_BEFORE: "plan/create-item-before",
    CREATE_ITEM_AT_END: "plan/create-item-at-end",
    SEND_TO_PLAN: typedAction("plan/send-to-plan", {
        planId: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
    }),
    DELETE_ITEM_BACKWARDS: "plan/delete-item-backwards",
    DELETE_ITEM_FORWARD: "plan/delete-item-forward",
    DELETE_SELECTED: "plan/delete-selected",
    SET_STATUS: typedAction("plan/set-status", {
        id: clientOrDatabaseIdType.isRequired,
        status: PropTypes.string.isRequired,
    }),
    BULK_SET_STATUS: typedAction("plan/bulk-set-status", {
        ids: PropTypes.arrayOf(clientOrDatabaseIdType).isRequired,
        status: PropTypes.string.isRequired,
    }),
    UNDO_SET_STATUS: "plan/undo-set-status",
    MOVE_NEXT: "plan/move-next",
    MOVE_PREVIOUS: "plan/move-previous",
    RENAME_ITEM: typedAction("plan/rename-item", {
        id: clientOrDatabaseIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
    SET_PLAN_GRANT: "plan/set-plan-grant",
    CLEAR_PLAN_GRANT: "plan/clear-plan-grant",
    NEST: "plan/nest",
    UNNEST: "plan/unnest",
    MOVE_SUBTREE: "plan/move-subtree",
    CREATE_BUCKET: typedAction("plan/create-bucket", {
        planId: clientOrDatabaseIdType.isRequired,
    }),
    GENERATE_ONE_WEEKS_BUCKETS: typedAction("plan/generate-one-weeks-buckets", {
        planId: clientOrDatabaseIdType.isRequired,
    }),
    RENAME_BUCKET: typedAction("plan/rename-bucket", {
        planId: clientOrDatabaseIdType.isRequired,
        id: clientOrDatabaseIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
    SET_BUCKET_DATE: typedAction("plan/set-bucket-date", {
        planId: clientOrDatabaseIdType.isRequired,
        id: clientOrDatabaseIdType.isRequired,
        date: PropTypes.instanceOf(Date), // can be null
    }),
    DELETE_BUCKET: typedAction("plan/delete-bucket", {
        planId: clientOrDatabaseIdType.isRequired,
        id: clientOrDatabaseIdType.isRequired,
    }),
    BUCKET_CREATED: typedAction("plan/bucket-created", {
        planId: PropTypes.number.isRequired,
        data: PropTypes.object.isRequired,
        oldId: clientOrDatabaseIdType.isRequired,
    }),
    BUCKET_UPDATED: typedAction("plan/bucket-updated", {
        planId: PropTypes.number.isRequired,
        data: PropTypes.object.isRequired,
    }),
    BUCKET_DELETED: typedAction("plan/bucket-deleted", {
        planId: PropTypes.number.isRequired,
        id: PropTypes.number.isRequired,
    }),
    ASSIGN_ITEM_TO_BUCKET: typedAction("plan/assign-item-to-bucket", {
        id: PropTypes.number.isRequired,
        bucketId: PropTypes.number,
    }),
    // ajax actions
    LOAD_PLANS: "plan/load-plans",
    PLANS_LOADED: "plan/plans-loaded",
    PLAN_CREATED: "plan/plan-created",
    PLAN_DELETED: "plan/plan-deleted",
    PLAN_GRANT_SET: "plan/plan-grant-set",
    PLAN_GRANT_CLEARED: "plan/plan-grant-cleared",
    PLAN_DELTAS: "plan/plan-deltas",
    TREE_CREATE: "plan/tree-create",
    UPDATED: "plan/updated",
    DELETED: "plan/deleted",
    // socket actions
    PLAN_DATA_BOOTSTRAPPED: "plan/plan-data-bootstrapped",
    // deferred actions
    FLUSH_RENAMES: "plan/flush-renames",
    FLUSH_STATUS_UPDATES: "plan/flush-status-updates",
};

export default PlanActions;
