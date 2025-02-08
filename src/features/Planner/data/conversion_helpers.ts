import throwAnyGraphQLErrors from "@/util/throwAnyGraphQLErrors";
import type {
    CorePlanItemLoadFragment,
    PlanItemLoadFragment,
    PlanLoadFragment,
} from "@/__generated__/graphql";
import {
    Plan as TPlan,
    PlanBucket as TPlanBucket,
    PlanItem as TPlanItem,
} from "@/features/Planner/data/planStore";
import { parseLocalDate } from "@/util/time";
import { FluxAction } from "@/data/dispatcher";

export const handleErrors = (error): FluxAction => {
    throwAnyGraphQLErrors(error);
    return {
        type: "promise-flux/error-fallthrough",
        error,
    };
};

const pluckIds = (collection: { id: string }[]) => {
    if (collection == null) return undefined;
    return collection.map((c) => c.id);
};

export const toRestPlanOrItem = (it) => {
    if (it.__typename === "Plan") {
        return toRestPlan(it);
    } else if (it.__typename === "PlanItem") {
        return toRestPlanItem(it);
    } else {
        throw new TypeError(`Unknown '${it.__typename}' for REST conversion?!`);
    }
};

export const toRestPlanItem = (
    planItem: CorePlanItemLoadFragment & PlanItemLoadFragment,
): TPlanItem => ({
    id: planItem.id,
    name: planItem.name,
    notes: planItem.notes,
    status: planItem.status,
    parentId: planItem.parent!.id,
    aggregateId: planItem.aggregate?.id,
    subtaskIds: pluckIds(planItem.children),
    componentIds: pluckIds(planItem.components),
    quantity: planItem.quantity?.quantity,
    units: planItem.quantity?.units?.name || undefined,
    uomId: planItem.quantity?.units?.id,
    ingredientId: planItem.ingredient?.id,
    bucketId: planItem.bucket?.id,
    preparation: planItem.preparation,
});

export const toRestPlan = (
    plan: CorePlanItemLoadFragment & PlanLoadFragment,
): TPlan => ({
    id: plan.id,
    name: plan.name,
    color: plan.color,
    acl: {
        ownerId: plan.owner.id,
        grants: plan.grants.reduce((agg, g) => {
            agg[g.user.id] = g.level;
            return agg;
        }, {}),
    },
    subtaskIds: pluckIds(plan.children),
    buckets: plan.buckets.map((b) => {
        const result: TPlanBucket = {
            id: b.id,
            date: parseLocalDate(b.date),
        };
        if (b.name) result.name = b.name;
        return result;
    }),
});
