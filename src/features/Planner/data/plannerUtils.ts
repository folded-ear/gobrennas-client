import { PlanItem } from "@/features/Planner/data/planStore";
import { Maybe } from "graphql/jsutils/Maybe";

function testName(
    itemOrName: Maybe<PlanItem | string>,
    test: (string) => boolean,
): boolean {
    if (itemOrName == null) return false;
    let name =
        itemOrName === "string" ? itemOrName : (itemOrName as PlanItem).name;
    if (name == null) return false;
    name = name.trim();
    return name.length > 0 && test(name);
}

function endsWith(itemOrName: Maybe<PlanItem | string>, suffix: string) {
    return testName(itemOrName, (name) => name.endsWith(suffix));
}

function startsWith(itemOrName: Maybe<PlanItem | string>, prefix: string) {
    return testName(itemOrName, (name) => name.startsWith(prefix));
}

export function isSection(itemOrName: PlanItem | string): boolean {
    return itemOrName["fromRecipe"] || endsWith(itemOrName, ":");
}

export function isDoNotRecognize(itemOrName: PlanItem | string): boolean {
    return startsWith(itemOrName, "!");
}

export function isQuestionable(itemOrName: PlanItem | string) {
    return endsWith(itemOrName, "?");
}

export function isParent(item: PlanItem) {
    return item.subtaskIds ? item.subtaskIds.length > 0 : false;
}

export function isExpanded(item: PlanItem) {
    return isParent(item) && !!item._expanded;
}
