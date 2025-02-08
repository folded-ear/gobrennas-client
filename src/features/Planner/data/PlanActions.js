import PropTypes from "prop-types";
import ClientId from "@/util/ClientId";
import typedAction from "@/util/typedAction";
import { bfsIdType } from "@/global/types/identity";

const PlanActions = {
    // user actions (with persistence)
    CREATE_PLAN: "plan/create-plan",
    DUPLICATE_PLAN: "plan/duplicate-plan",
    RENAME_PLAN: typedAction("plan/rename-plan", {
        id: bfsIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
    SET_PLAN_COLOR: typedAction("plan/set-plan-color", {
        id: bfsIdType.isRequired,
        color: PropTypes.string.isRequired,
    }),
    DELETE_PLAN: "plan/delete-plan",
    PLAN_DETAIL_VISIBILITY: "plan/plan-detail-visibility",
    CREATE_ITEM_AFTER: "plan/create-item-after",
    CREATE_ITEM_BEFORE: "plan/create-item-before",
    CREATE_ITEM_AT_END: "plan/create-item-at-end",
    SEND_TO_PLAN: typedAction("plan/send-to-plan", {
        planId: bfsIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
    DELETE_ITEM_BACKWARDS: "plan/delete-item-backwards",
    DELETE_ITEM_FORWARD: "plan/delete-item-forward",
    DELETE_SELECTED: "plan/delete-selected",
    SET_STATUS: typedAction("plan/set-status", {
        id: bfsIdType.isRequired,
        status: PropTypes.string.isRequired,
    }),
    COMPLETE_PLAN_ITEM: typedAction("plan/complete-plan-item", {
        id: bfsIdType.isRequired,
        status: PropTypes.string.isRequired,
        doneAt: PropTypes.instanceOf(Date), // can be null
    }),
    BULK_SET_STATUS: typedAction("plan/bulk-set-status", {
        ids: PropTypes.arrayOf(bfsIdType).isRequired,
        status: PropTypes.string.isRequired,
    }),
    UNDO_SET_STATUS: "plan/undo-set-status",
    MOVE_NEXT: "plan/move-next",
    MOVE_PREVIOUS: "plan/move-previous",
    RENAME_ITEM: typedAction("plan/rename-item", {
        id: bfsIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
    SET_PLAN_GRANT: "plan/set-plan-grant",
    CLEAR_PLAN_GRANT: "plan/clear-plan-grant",
    NEST: "plan/nest",
    UNNEST: "plan/unnest",
    MOVE_SUBTREE: "plan/move-subtree",
    CREATE_BUCKET: typedAction("plan/create-bucket", {
        planId: bfsIdType.isRequired,
    }),
    RESET_TO_THIS_WEEKS_BUCKETS: typedAction(
        "plan/reset-to-this-weeks-buckets",
        {
            planId: bfsIdType.isRequired,
        },
    ),
    RENAME_BUCKET: typedAction("plan/rename-bucket", {
        planId: bfsIdType.isRequired,
        id: bfsIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
    SET_BUCKET_DATE: typedAction("plan/set-bucket-date", {
        planId: bfsIdType.isRequired,
        id: bfsIdType.isRequired,
        date: PropTypes.instanceOf(Date), // can be null
    }),
    DELETE_BUCKET: typedAction("plan/delete-bucket", {
        planId: bfsIdType.isRequired,
        id: bfsIdType.isRequired,
    }),
    BUCKET_CREATED: typedAction("plan/bucket-created", {
        planId: bfsIdType.isRequired,
        clientId: ClientId.propType.isRequired,
        data: PropTypes.object.isRequired,
    }),
    BUCKET_UPDATED: typedAction("plan/bucket-updated", {
        planId: bfsIdType.isRequired,
        data: PropTypes.object.isRequired,
    }),
    BUCKET_DELETED: typedAction("plan/bucket-deleted", {
        planId: bfsIdType.isRequired,
        id: bfsIdType.isRequired,
    }),
    BUCKETS_DELETED: typedAction("plan/bucket-deleted", {
        planId: bfsIdType.isRequired,
        ids: PropTypes.arrayOf(bfsIdType).isRequired,
    }),
    ASSIGN_ITEM_TO_BUCKET: typedAction("plan/assign-item-to-bucket", {
        id: bfsIdType.isRequired,
        bucketId: bfsIdType, // can be null (to clear)
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
