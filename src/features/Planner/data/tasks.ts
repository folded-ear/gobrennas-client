import { Task } from "./TaskStore";
import { Maybe } from "graphql/jsutils/Maybe";

function endsWith(taskOrName: Maybe<Task | string>, char: string) {
    if (taskOrName == null) return false;
    let name = taskOrName === "string"
        ? taskOrName
        : (taskOrName as Task).name;
    if (name == null) return false;
    name = name.trim();
    if (name.length === 0) return false;
    return name.charAt(name.length - 1) === char;
}

export function isSection(taskOrName: Task | string): boolean {
    return taskOrName["fromRecipe"] || endsWith(taskOrName, ":");
}

export function isQuestionable(taskOrName: Task | string) {
    return endsWith(taskOrName, "?");
}

export function isParent(task: Task) {
    return task.subtaskIds
        ? task.subtaskIds.length > 0
        : false;
}

export function isExpanded(task: Task) {
    return isParent(task) && !!task._expanded;
}
