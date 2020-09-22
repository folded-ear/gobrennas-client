import TaskActions from "./TaskActions";

const ShoppingActions = {
    TOGGLE_PLAN: "shopping/toggle-plan",
    RENAME_ITEM: TaskActions.RENAME_TASK,
    MARK_COMPLETE: TaskActions.MARK_COMPLETE,
    FOCUS: "shopping/focus",
    DELETE_ITEM: TaskActions.DELETE_TASK_FORWARD,
    UNDO_DELETE: TaskActions.UNDO_DELETE,
    TOGGLE_EXPANDED: "shopping/toggle-expanded",
    SET_INGREDIENT_STATUS: "shopping/set-ingredient-status",
    UNDO_SET_INGREDIENT_STATUS: "shopping/undo-set-ingredient-status",
};

export default ShoppingActions;
