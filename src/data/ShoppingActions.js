import TaskActions from "./TaskActions";

const ShoppingActions = {
    TOGGLE_PLAN: "shopping/toggle-plan",
    RENAME_ITEM: TaskActions.RENAME_TASK,
    MARK_COMPLETE: TaskActions.MARK_COMPLETE,
    FOCUS: "shopping/focus",
    FOCUS_PREVIOUS: "shopping/focus-previous",
    FOCUS_NEXT: "shopping/focus-next",
    DELETE_ITEM: TaskActions.DELETE_TASK_FORWARD,
    UNDO_DELETE: TaskActions.UNDO_DELETE,
};

export default ShoppingActions;
