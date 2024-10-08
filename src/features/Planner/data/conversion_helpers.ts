import throwAnyGraphQLErrors from "@/util/throwAnyGraphQLErrors";
import { ensureInt } from "@/global/utils";
import { BfsId } from "@/global/types/identity";
import type {
    PlanCoreFragment,
    RenamePlanItemMutation,
} from "@/__generated__/graphql";

export const handleErrors = (error) => {
    throwAnyGraphQLErrors(error);
    return {
        type: "promise-flux/error-fallthrough",
        error,
    };
};

const ensureIdIsInt = (id: BfsId | undefined) => {
    if (id == null) return null;
    return ensureInt(id);
};

const pluckIntIds = (collection: { id: BfsId }[]) => {
    if (collection == null) return null;
    return collection.map((c) => ensureInt(c.id));
};

export const toRestPlanItem = (
    planItem: NonNullable<RenamePlanItemMutation["planner"]>["rename"],
) => ({
    id: ensureInt(planItem.id),
    name: planItem.name,
    notes: planItem.notes,
    status: planItem.status,
    parentId: ensureIdIsInt(planItem.parent?.id),
    aggregateId: ensureIdIsInt(planItem.aggregate?.id),
    subtaskIds: pluckIntIds(planItem.children),
    componentIds: pluckIntIds(planItem.components),
    quantity: planItem.quantity?.quantity,
    units: planItem.quantity?.units?.name || null,
    uomId: ensureIdIsInt(planItem.quantity?.units?.id),
    ingredientId: ensureIdIsInt(planItem.ingredient?.id),
    bucketId: ensureIdIsInt(planItem.bucket?.id),
    preparation: planItem.preparation,
});

export const toRestPlan = (plan: PlanCoreFragment) => ({
    id: ensureInt(plan.id),
    name: plan.name,
    color: plan.color,
    acl: {
        ownerId: ensureInt(plan.owner.id),
    },
    subtaskIds: pluckIntIds(plan.children),
});
