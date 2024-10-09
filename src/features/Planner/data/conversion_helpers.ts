import throwAnyGraphQLErrors from "@/util/throwAnyGraphQLErrors";
import { ensureInt } from "@/global/utils";
import { BfsId } from "@/global/types/identity";
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

export const handleErrors = (error) => {
    throwAnyGraphQLErrors(error);
    return {
        type: "promise-flux/error-fallthrough",
        error,
    };
};

const ensureIdIsInt = (id: BfsId | undefined) => {
    if (id == null) return undefined;
    return ensureInt(id);
};

const pluckIntIds = (collection: { id: BfsId }[]) => {
    if (collection == null) return undefined;
    return collection.map((c) => ensureInt(c.id));
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

const toRestPlanItem = (
    planItem: CorePlanItemLoadFragment & PlanItemLoadFragment,
): TPlanItem => ({
    id: ensureInt(planItem.id),
    name: planItem.name,
    notes: planItem.notes,
    status: planItem.status,
    parentId: ensureIdIsInt(planItem.parent?.id),
    aggregateId: ensureIdIsInt(planItem.aggregate?.id),
    subtaskIds: pluckIntIds(planItem.children),
    componentIds: pluckIntIds(planItem.components),
    quantity: planItem.quantity?.quantity,
    units: planItem.quantity?.units?.name || undefined,
    uomId: ensureIdIsInt(planItem.quantity?.units?.id),
    ingredientId: ensureIdIsInt(planItem.ingredient?.id),
    bucketId: ensureIdIsInt(planItem.bucket?.id),
    preparation: planItem.preparation,
});

export const toRestPlan = (
    plan: CorePlanItemLoadFragment & PlanLoadFragment,
): TPlan => ({
    id: ensureInt(plan.id),
    name: plan.name,
    color: plan.color,
    acl: {
        ownerId: ensureInt(plan.owner.id),
        grants: plan.grants.reduce((agg, g) => {
            agg[g.user.id] = g.level;
            return agg;
        }, {}),
    },
    subtaskIds: pluckIntIds(plan.children),
    buckets: plan.buckets.map((b) => {
        const result: TPlanBucket = {
            id: ensureInt(b.id),
            date: b.date,
        };
        if (b.name) result.name = b.name;
        return result;
    }),
});
