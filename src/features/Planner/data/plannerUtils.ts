import { PlanItem } from "features/Planner/data/planStore";
import { Maybe } from "graphql/jsutils/Maybe";

function endsWith(itemOrName: Maybe<PlanItem | string>, char: string) {
    if (itemOrName == null) return false;
    let name = itemOrName === "string"
        ? itemOrName
        : (itemOrName as PlanItem).name;
    if (name == null) return false;
    name = name.trim();
    if (name.length === 0) return false;
    return name.charAt(name.length - 1) === char;
}

export function isSection(itemOrName: PlanItem | string): boolean {
    return itemOrName["fromRecipe"] || endsWith(itemOrName, ":");
}

export function isQuestionable(itemOrName: PlanItem | string) {
    return endsWith(itemOrName, "?");
}

export function isParent(item: PlanItem) {
    return item.subtaskIds
        ? item.subtaskIds.length > 0
        : false;
}

export function isExpanded(item: PlanItem) {
    return isParent(item) && !!item._expanded;
}
