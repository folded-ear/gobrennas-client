import { PlanItem } from "features/Planner/data/planStore";
import { Maybe } from "graphql/jsutils/Maybe";

function endsWith(taskOrName: Maybe<PlanItem | string>, char: string) {
    if (taskOrName == null) return false;
    let name = taskOrName === "string"
        ? taskOrName
        : (taskOrName as PlanItem).name;
    if (name == null) return false;
    name = name.trim();
    if (name.length === 0) return false;
    return name.charAt(name.length - 1) === char;
}

export function isSection(taskOrName: PlanItem | string): boolean {
    return taskOrName["fromRecipe"] || endsWith(taskOrName, ":");
}

export function isQuestionable(taskOrName: PlanItem | string) {
    return endsWith(taskOrName, "?");
}

export function isParent(task: PlanItem) {
    return task.subtaskIds
        ? task.subtaskIds.length > 0
        : false;
}

export function isExpanded(task: PlanItem) {
    return isParent(task) && !!task._expanded;
}
