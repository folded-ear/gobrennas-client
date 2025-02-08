import PropTypes from "prop-types";
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
