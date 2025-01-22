import throwAnyGraphQLErrors from "@/util/throwAnyGraphQLErrors";
import { BfsId, ensureString } from "@/global/types/identity";
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

const ensureIdIsString = (id: BfsId | undefined) => {
    if (id == null) return undefined;
    return ensureString(id);
};

const pluckStringIds = (collection: { id: BfsId }[]) => {
    if (collection == null) return undefined;
    return collection.map((c) => ensureString(c.id));
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
    id: ensureString(planItem.id),
    name: planItem.name,
    notes: planItem.notes,
    status: planItem.status,
    // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
    parentId: ensureIdIsString(planItem.parent?.id)!!,
    aggregateId: ensureIdIsString(planItem.aggregate?.id),
    subtaskIds: pluckStringIds(planItem.children),
    componentIds: pluckStringIds(planItem.components),
    quantity: planItem.quantity?.quantity,
    units: planItem.quantity?.units?.name || undefined,
    uomId: ensureIdIsString(planItem.quantity?.units?.id),
    ingredientId: ensureIdIsString(planItem.ingredient?.id),
    bucketId: ensureIdIsString(planItem.bucket?.id),
    preparation: planItem.preparation,
});

export const toRestPlan = (
    plan: CorePlanItemLoadFragment & PlanLoadFragment,
): TPlan => ({
    id: ensureString(plan.id),
    name: plan.name,
    color: plan.color,
    acl: {
        ownerId: ensureString(plan.owner.id),
        grants: plan.grants.reduce((agg, g) => {
            agg[g.user.id] = g.level;
            return agg;
        }, {}),
    },
    subtaskIds: pluckStringIds(plan.children),
    buckets: plan.buckets.map((b) => {
        const result: TPlanBucket = {
            id: ensureString(b.id),
            date: b.date ? new Date(b.date) : null,
        };
        if (b.name) result.name = b.name;
        return result;
    }),
});
