import { Plan, PlanItem } from "@/features/Planner/data/planStore";
import { Maybe } from "graphql/jsutils/Maybe";
import { Named } from "@/util/comparators";

function testName(
    itemOrName: Maybe<Named | string>,
    test: (string) => boolean,
): boolean {
    if (itemOrName == null) return false;
    let name = typeof itemOrName === "string" ? itemOrName : itemOrName.name;
    if (name == null) return false;
    name = name.trim();
    return name.length > 0 && test(name);
}

function endsWith(itemOrName: Maybe<Named | string>, suffix: string) {
    return testName(itemOrName, (name) => name.endsWith(suffix));
}

function startsWith(itemOrName: Maybe<Named | string>, prefix: string) {
    return testName(itemOrName, (name) => name.startsWith(prefix));
}

export function isSection(itemOrName: Named | string): boolean {
    return itemOrName["fromRecipe"] || endsWith(itemOrName, ":");
}

export function isDoNotRecognize(itemOrName: Named | string): boolean {
    return startsWith(itemOrName, "!");
}

export function isQuestionable(itemOrName: Named | string) {
    return endsWith(itemOrName, "?");
}

export function isParent(item: Plan | PlanItem) {
    return item.subtaskIds ? item.subtaskIds.length > 0 : false;
}

export function isExpanded(item: PlanItem) {
    return isParent(item) && !!item._expanded;
}
