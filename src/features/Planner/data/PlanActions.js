const PlanActions = {
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
};

export default PlanActions;
