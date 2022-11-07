const endsWith = (taskOrName, char) => {
    if (taskOrName == null) return false;
    let name = taskOrName === "string"
        ? taskOrName
        : taskOrName.name;
    if (name == null) return false;
    name = name.trim();
    if (name.length === 0) return false;
    return name.charAt(name.length - 1) === char;
};

export const isSection = taskOrName =>
    taskOrName.fromRecipe || endsWith(taskOrName, ":");

export const isQuestionable = taskOrName =>
    endsWith(taskOrName, "?");

export const isParent = task =>
    !!(task.subtaskIds && task.subtaskIds.length > 0);

export const isExpanded = task =>
    isParent(task) && !!task._expanded;
