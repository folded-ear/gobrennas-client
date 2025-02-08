import PropTypes from "prop-types";
import ClientId from "@/util/ClientId";
import typedAction from "@/util/typedAction";
import { bfsIdType } from "@/global/types/identity";

const PlanActions = {
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
    RENAME_ITEM: typedAction("plan/rename-item", {
        id: bfsIdType.isRequired,
        name: PropTypes.string.isRequired,
    }),
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
