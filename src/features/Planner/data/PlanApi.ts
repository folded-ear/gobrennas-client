import promiseFlux, {
    defaultErrorHandler,
    soakUpUnauthorized,
} from "@/util/promiseFlux";
import PlanActions from "./PlanActions";
import { client } from "@/providers/ApolloClient";
import {
    ASSIGN_BUCKET,
    CREATE_BUCKET,
    CREATE_PLAN,
    CREATE_PLAN_ITEM,
    DELETE_BUCKET,
    DELETE_PLAN,
    DELETE_PLAN_ITEM,
    MUTATE_PLAN_TREE,
    RENAME_PLAN_OR_ITEM,
    REORDER_PLAN_ITEMS,
    REVOKE_PLAN_GRANT,
    SET_PLAN_COLOR,
    SET_PLAN_GRANT,
    SET_PLAN_ITEM_STATUS,
    SPLICE_BUCKETS,
    UPDATE_BUCKET,
} from "@/features/Planner/data/mutations";
import {
    handleErrors,
    toRestPlan,
    toRestPlanItem,
    toRestPlanOrItem,
} from "@/features/Planner/data/conversion_helpers";
import { BfsId, BfsStringId, ensureString } from "@/global/types/identity";
import { PlanBucket } from "./planStore";
import serializeObjectOfPromiseFns from "@/util/serializeObjectOfPromiseFns";
import {
    GET_PLAN_SHARE_INFO,
    LOAD_DESCENDANTS,
    LOAD_PLANS,
} from "@/features/Planner/data/queries";
import { willStatusDelete } from "@/features/Planner/data/PlanItemStatus";
import { StatusChange, TreeMutationSpec } from "@/features/Planner/data/utils";
import { formatLocalDate, parseLocalDate } from "@/util/time";
import { Maybe } from "graphql/jsutils/Maybe";
import dispatcher from "@/data/dispatcher";
import { GET_PLANS } from "@/data/hooks/useGetAllPlans";
import AccessLevel from "@/data/AccessLevel";
import { ShareInfo } from "@/global/types/types";

interface WireBucket extends Omit<PlanBucket, "date"> {
    date: Maybe<string>;
}

function deserializeBucket(b: WireBucket): PlanBucket {
    return { ...b, date: parseLocalDate(b.date) };
}

const PlanApi = {
    createPlan: (name: string, clientId: BfsId, sourcePlanId?: BfsId) =>
        promiseFlux(
            client.mutate({
                mutation: CREATE_PLAN,
                variables: {
                    name,
                    sourcePlanId:
                        sourcePlanId == null
                            ? null
                            : ensureString(sourcePlanId),
                },
                refetchQueries: [GET_PLANS],
            }),
            ({ data }) => {
                const plan = data!.planner.createPlan || null;
                return {
                    type: PlanActions.PLAN_CREATED,
                    clientId,
                    id: plan.id,
                    data: toRestPlan(plan),
                    fromId: sourcePlanId,
                };
            },
            handleErrors,
        ),

    loadPlans: () =>
        promiseFlux(
            client.query({ query: LOAD_PLANS }),
            ({ data }) => ({
                type: PlanActions.PLANS_LOADED,
                data: data.planner.plans.map(toRestPlan),
            }),
            soakUpUnauthorized,
        ),

    deletePlan: (id: BfsId) =>
        promiseFlux(
            client.mutate({
                mutation: DELETE_PLAN,
                variables: {
                    id: ensureString(id),
                },
            }),
            ({ data }) => ({
                type: PlanActions.PLAN_DELETED,
                id: data?.planner.deletePlan.id,
            }),
        ).then(() => {
            client.refetchQueries({ include: [GET_PLANS] });
        }),

    setPlanGrant: (id: BfsStringId, userId: BfsId, accessLevel: AccessLevel) =>
        promiseFlux(
            client.mutate({
                mutation: SET_PLAN_GRANT,
                variables: {
                    planId: id,
                    userId: ensureString(userId),
                    accessLevel,
                },
            }),
            () => ({
                type: PlanActions.PLAN_GRANT_SET,
                id,
                userId,
            }),
        ),

    clearPlanGrant: (id: BfsStringId, userId: BfsId) =>
        promiseFlux(
            client.mutate({
                mutation: REVOKE_PLAN_GRANT,
                variables: {
                    planId: id,
                    userId: ensureString(userId),
                },
            }),
            () => ({
                type: PlanActions.PLAN_GRANT_CLEARED,
                id,
                userId,
            }),
        ),

    createItem: (
        id: BfsId,
        parentId: BfsId,
        afterId: Maybe<BfsId>,
        name: string,
    ) =>
        promiseFlux(
            client.mutate({
                mutation: CREATE_PLAN_ITEM,
                variables: {
                    parentId: ensureString(parentId),
                    afterId: afterId ? ensureString(afterId) : null,
                    name,
                },
            }),
            ({ data }) => {
                const item = data!.planner.createItem;
                return {
                    type: PlanActions.TREE_CREATE,
                    data: [
                        toRestPlanItem(item),
                        toRestPlanOrItem(item.fullParent!),
                    ],
                    newIds: { [item.id]: id },
                };
            },
        ),

    renameItem: (id: BfsId, name: string) =>
        promiseFlux(
            client.mutate({
                mutation: RENAME_PLAN_OR_ITEM,
                variables: {
                    id: ensureString(id),
                    name,
                },
            }),
            ({ data }) => {
                const poi = data?.planner?.rename || null;
                return {
                    type: PlanActions.UPDATED,
                    data: poi && toRestPlanOrItem(poi),
                };
            },
            handleErrors,
        ),

    setPlanColor: (id: BfsId, color: string) =>
        promiseFlux(
            client.mutate({
                mutation: SET_PLAN_COLOR,
                variables: {
                    id: ensureString(id),
                    color,
                },
            }),
            ({ data }) => {
                const plan = data?.planner?.setColor;
                return {
                    type: PlanActions.UPDATED,
                    data: plan && toRestPlan(plan),
                };
            },
            handleErrors,
        ),

    // used for immediate deletion of a blank item, bypassing the status queue
    deleteItem: (id: BfsId) =>
        promiseFlux(
            client.mutate({
                mutation: DELETE_PLAN_ITEM,
                variables: {
                    id: ensureString(id),
                },
            }),
            ({ data }) => {
                const id = data!.planner.deleteItem.id;
                return {
                    type: PlanActions.DELETED,
                    id,
                };
            },
            handleErrors,
        ),

    updateItemStatus: (id: BfsId, { status, doneAt }: StatusChange) => {
        return promiseFlux(
            client.mutate({
                mutation: SET_PLAN_ITEM_STATUS,
                variables: {
                    id: ensureString(id),
                    status,
                    doneAt: doneAt?.toISOString() || null,
                },
            }),
            ({ data }) => {
                const info = data!.planner.setStatus;
                return willStatusDelete(info.status)
                    ? {
                          type: PlanActions.DELETED,
                          id: info?.id,
                      }
                    : {
                          type: PlanActions.UPDATED,
                          data: toRestPlanItem(info!),
                      };
            },
        );
    },

    mutateTree: (spec: TreeMutationSpec) =>
        client.mutate({
            mutation: MUTATE_PLAN_TREE,
            variables: {
                spec: {
                    ids: spec.ids.map(ensureString),
                    parentId: ensureString(spec.parentId),
                    afterId:
                        spec.afterId == null
                            ? null
                            : ensureString(spec.afterId),
                },
            },
        }),

    assignBucket: (id: BfsId, bucketId: BfsId | null) =>
        client.mutate({
            mutation: ASSIGN_BUCKET,
            variables: {
                id: ensureString(id),
                bucketId: bucketId == null ? null : ensureString(bucketId),
            },
        }),

    reorderSubitems: (id: BfsId, subitemIds: BfsId[]) =>
        client.mutate({
            mutation: REORDER_PLAN_ITEMS,
            variables: {
                parentId: ensureString(id),
                itemIds: subitemIds.map(ensureString),
            },
        }),

    promiseShareInfo: (id: BfsId) =>
        client
            .query({
                query: GET_PLAN_SHARE_INFO,
                variables: {
                    id: ensureString(id),
                },
            })
            .then(({ data }) => data.planner.plan.share as ShareInfo),

    getDescendantsAsList: (id: BfsId) =>
        promiseFlux(
            client.query({
                query: LOAD_DESCENDANTS,
                variables: {
                    id: ensureString(id),
                },
            }),
            ({ data }) => ({
                type: PlanActions.PLAN_DATA_BOOTSTRAPPED,
                id,
                data: [toRestPlanOrItem(data.planner.planOrItem)].concat(
                    data.planner.planOrItem.descendants.map(toRestPlanItem),
                ),
            }),
        ),

    createBucket: (planId: BfsId, bucket: PlanBucket) => {
        const clientId = bucket.id;
        return promiseFlux(
            client.mutate({
                mutation: CREATE_BUCKET,
                variables: {
                    planId: ensureString(planId),
                    name: bucket.name ?? null,
                    date: formatLocalDate(bucket.date),
                },
            }),
            ({ data }) => {
                const bucket = data!.planner.createBucket;
                return {
                    type: PlanActions.BUCKET_CREATED,
                    planId,
                    clientId: clientId,
                    data: deserializeBucket(bucket),
                };
            },
            handleErrors,
        );
    },

    updateBucket: (planId: BfsId, id: BfsId, bucket: PlanBucket) =>
        promiseFlux(
            client.mutate({
                mutation: UPDATE_BUCKET,
                variables: {
                    planId: ensureString(planId),
                    bucketId: ensureString(id),
                    name: bucket.name ?? null,
                    date: formatLocalDate(bucket.date),
                },
            }),
            ({ data }) => {
                const bucket = data!.planner.updateBucket;
                return {
                    type: PlanActions.BUCKET_UPDATED,
                    planId,
                    data: deserializeBucket(bucket),
                };
            },
        ),

    deleteBucket: (planId: BfsId, id: BfsId) => {
        client.cache.evict({ id: ensureString(id) });
        return promiseFlux(
            client.mutate({
                mutation: DELETE_BUCKET,
                variables: {
                    planId: ensureString(planId),
                    bucketId: ensureString(id),
                },
            }),
            ({ data }) => {
                const bucket = data!.planner.deleteBucket;
                return {
                    type: PlanActions.BUCKET_DELETED,
                    planId,
                    id: bucket.id,
                };
            },
        );
    },

    spliceBuckets: (
        planId: BfsId,
        idsToDelete: BfsId[],
        toCreate: PlanBucket[],
    ) =>
        client
            .mutate({
                mutation: SPLICE_BUCKETS,
                variables: {
                    planId: ensureString(planId),
                    idsToDelete: idsToDelete.map((id) => ensureString(id)),
                    toCreate: toCreate.map((b) => ({
                        name: b.name ?? null,
                        date: formatLocalDate(b.date),
                    })),
                },
            })
            .then(({ data }) => {
                if (idsToDelete.length) {
                    dispatcher.dispatch({
                        type: PlanActions.BUCKETS_DELETED,
                        planId,
                        ids: data!.planner.deleteBuckets.map((d) => d.id),
                    });
                }
                if (toCreate.length) {
                    // This is sort silly, but the remoting is the important
                    // part to do in bulk.
                    data!.planner.createBuckets.forEach((b, i) => {
                        dispatcher.dispatch({
                            type: PlanActions.BUCKET_CREATED,
                            planId,
                            clientId: toCreate[i].id,
                            data: deserializeBucket(b),
                        });
                    });
                }
            }, defaultErrorHandler),
};

export default serializeObjectOfPromiseFns(PlanApi);
