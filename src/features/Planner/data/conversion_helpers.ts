import throwAnyGraphQLErrors from "util/throwAnyGraphQLErrors";
import { ensureInt } from "global/utils";

export const handleErrors = (error) => {
    throwAnyGraphQLErrors(error);
    return {
        type: "promise-flux/error-fallthrough",
        error,
    };
};

export const toRestPlanItem = (planItem) => ({
    id: ensureInt(planItem.id),
    name: planItem.name,
    notes: planItem.notes,
    status: planItem.status,
    parentId: planItem.parent?.id ? ensureInt(planItem.parent?.id) : null,
    aggregateId: planItem.aggregate?.id
        ? ensureInt(planItem.aggregate?.id)
        : null,
    quantity: planItem.quantity?.quantity || null,
    units: planItem.quantity?.units?.name || null,
    uomId: planItem.quantity?.units?.id
        ? ensureInt(planItem.quantity?.units?.id)
        : null,
    ingredientId: planItem.ingredient?.id
        ? ensureInt(planItem.ingredient?.id)
        : null,
    bucketId: planItem.bucket?.id ? ensureInt(planItem.bucket?.id) : null,
    preparation: planItem.preparation,
});
