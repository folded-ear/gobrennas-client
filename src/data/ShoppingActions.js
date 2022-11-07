import TaskActions from "features/Planner/data/TaskActions";

const ShoppingActions = {
    TOGGLE_PLAN: "shopping/toggle-plan",
    RENAME_ITEM: TaskActions.RENAME_TASK,
    FOCUS: "shopping/focus",
    TOGGLE_EXPANDED: "shopping/toggle-expanded",
    SET_INGREDIENT_STATUS: "shopping/set-ingredient-status",
    UNDO_SET_INGREDIENT_STATUS: "shopping/undo-set-ingredient-status",
    CREATE_ITEM_AFTER: "shopping/create-item-after",
    CREATE_ITEM_BEFORE: "shopping/create-item-before",
    CREATE_ITEM_AT_END: "shopping/create-item-at-end",
    DELETE_ITEM_BACKWARDS: "shopping/delete-item-backwards",
    DELETE_ITEM_FORWARD: "shopping/delete-item-forward",
};

export default ShoppingActions;
