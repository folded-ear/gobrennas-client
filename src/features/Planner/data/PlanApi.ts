import BaseAxios from "axios";
import { API_BASE_URL } from "@/constants";
import promiseFlux, { soakUpUnauthorized } from "@/util/promiseFlux";
import PlanActions from "./PlanActions";
import { client } from "@/providers/ApolloClient";
import {
    COMPLETE_PLAN_ITEM,
    CREATE_BUCKET,
    DELETE_BUCKET,
    DELETE_BUCKETS,
    DELETE_PLAN_ITEM,
    RENAME_PLAN_OR_ITEM,
    SET_PLAN_COLOR,
    UPDATE_BUCKET,
} from "./mutations";
import type {
    CreateBucketMutation,
    DeleteBucketMutation,
    DeleteBucketsMutation,
    DeletePlanItemMutation,
    PlanItemsUpdatedSinceQuery,
    RenamePlanOrItemMutation,
    SetPlanColorMutation,
    UpdateBucketMutation,
} from "@/__generated__/graphql";
import {
    CompletePlanItemMutation,
    PlanItemStatus,
} from "@/__generated__/graphql";
import type { FetchResult } from "@apollo/client";
import {
    handleErrors,
    toRestPlan,
    toRestPlanOrItem,
} from "@/features/Planner/data/conversion_helpers";
import { BfsId, ensureString } from "@/global/types/identity";
import { WireBucket } from "./planStore";
import serializeObjectOfPromiseFns from "@/util/serializeObjectOfPromiseFns";
import { GET_UPDATED_SINCE } from "@/features/Planner/data/queries";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/plan`,
});

const PlanApi = {
    createItem: (planId: BfsId, body) =>
        promiseFlux(axios.post(`/${planId}`, body), (r) => ({
            type: PlanActions.TREE_CREATE,
            data: r.data.info,
            newIds: r.data.newIds,
        })),

    renameItem: (id: BfsId, name: string) =>
        promiseFlux(
            client.mutate({
                mutation: RENAME_PLAN_OR_ITEM,
                variables: {
                    id: ensureString(id),
                    name,
                },
            }),
            (result: FetchResult<RenamePlanOrItemMutation>) => {
                const data = result?.data?.planner?.rename || null;
                return {
                    type: PlanActions.UPDATED,
                    data: data && toRestPlanOrItem(data),
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
            (result: FetchResult<SetPlanColorMutation>) => {
                const plan = result?.data?.planner?.setColor;
                return {
                    type: PlanActions.UPDATED,
                    data: plan && toRestPlan(plan),
                };
            },
            handleErrors,
        ),

    deleteItem: (id: BfsId) =>
        promiseFlux(
            client.mutate({
                mutation: DELETE_PLAN_ITEM,
                variables: {
                    id: ensureString(id),
                },
            }),
            (result: FetchResult<DeletePlanItemMutation>) => {
                const id = result?.data?.planner?.deleteItem?.id || null;
                return (
                    id && {
                        type: PlanActions.DELETED,
                        id,
                    }
                );
            },
            handleErrors,
        ),

    completeItem: (id: BfsId, doneAt: Date) =>
        promiseFlux(
            client.mutate({
                mutation: COMPLETE_PLAN_ITEM,
                variables: {
                    id: ensureString(id),
                    status: PlanItemStatus.Completed,
                    doneAt: doneAt?.toISOString() || null,
                },
            }),
            (result: FetchResult<CompletePlanItemMutation>) => {
                const id = result?.data?.planner?.setStatus?.id || null;
                return (
                    id && {
                        type: PlanActions.PLAN_ITEM_COMPLETED,
                        id,
                    }
                );
            },
            handleErrors,
        ),

    updateItemStatus: (planId: BfsId, body) =>
        promiseFlux(axios.put(`/${planId}/status`, body), (r) =>
            r.data.type === "delete"
                ? {
                      type: PlanActions.DELETED,
                      id: r.data.id,
                  }
                : {
                      type: PlanActions.UPDATED,
                      data: r.data.info,
                  },
        ),

    mutateTree: (planId: BfsId, body) =>
        axios.post(`/${planId}/mutate-tree`, body),

    assignBucket: (planId: BfsId, id: BfsId, bucketId: BfsId) =>
        axios.post(`/${planId}/assign-bucket`, {
            id,
            bucketId,
        }),

    reorderSubitems: (id: BfsId, subitemIds: BfsId[]) =>
        axios.post(`/${id}/reorder-subitems`, {
            id,
            subitemIds,
        }),

    getDescendantsAsList: (id: BfsId) =>
        promiseFlux(axios.get(`/${id}/descendants`), (r) => ({
            type: PlanActions.PLAN_DATA_BOOTSTRAPPED,
            id,
            data: r.data,
        })),

    getItemsUpdatedSince: (id: BfsId, cutoff) =>
        promiseFlux(
            client.query({
                query: GET_UPDATED_SINCE,
                variables: {
                    planId: ensureString(id),
                    cutoff,
                },
                fetchPolicy: "network-only",
            }),
            ({ data }: { data: PlanItemsUpdatedSinceQuery }) => {
                return {
                    type: PlanActions.PLAN_DELTAS,
                    id,
                    data: (data.planner?.updatedSince || []).map(
                        toRestPlanOrItem,
                    ),
                };
            },
            soakUpUnauthorized,
        ),

    createBucket: (planId: BfsId, bucket: WireBucket) => {
        const clientId = bucket.id;
        return promiseFlux(
            client.mutate({
                mutation: CREATE_BUCKET,
                variables: {
                    planId: planId.toString(),
                    name: bucket.name,
                    date: bucket.date,
                },
            }),
            (result: FetchResult<CreateBucketMutation>) => {
                const bucket = result?.data?.planner?.createBucket || null;
                return (
                    bucket && {
                        type: PlanActions.BUCKET_CREATED,
                        planId,
                        clientId: clientId,
                        data: bucket,
                    }
                );
            },
            handleErrors,
        );
    },

    updateBucket: (planId: BfsId, id: BfsId, bucket: WireBucket) =>
        promiseFlux(
            client.mutate({
                mutation: UPDATE_BUCKET,
                variables: {
                    planId: ensureString(planId),
                    bucketId: ensureString(id),
                    name: bucket.name,
                    date: bucket.date,
                },
            }),
            (result: FetchResult<UpdateBucketMutation>) => {
                const bucket = result?.data?.planner?.updateBucket || null;
                return (
                    bucket && {
                        type: PlanActions.BUCKET_UPDATED,
                        planId,
                        data: bucket,
                    }
                );
            },
        ),

    deleteBucket: (planId: BfsId, id: BfsId) =>
        promiseFlux(
            client.mutate({
                mutation: DELETE_BUCKET,
                variables: {
                    planId: ensureString(planId),
                    bucketId: ensureString(id),
                },
            }),
            (result: FetchResult<DeleteBucketMutation>) => {
                const bucket = result?.data?.planner?.deleteBucket || null;
                return (
                    bucket && {
                        type: PlanActions.BUCKET_DELETED,
                        planId,
                        id: bucket.id,
                    }
                );
            },
        ),

    deleteBuckets: (planId: BfsId, ids: BfsId[]) =>
        promiseFlux(
            client.mutate({
                mutation: DELETE_BUCKETS,
                variables: {
                    planId: planId.toString(),
                    bucketIds: ids.map((id) => id.toString()),
                },
            }),
            (result: FetchResult<DeleteBucketsMutation>) => {
                const dels = result?.data?.planner?.deleteBuckets || [];
                return {
                    type: PlanActions.BUCKETS_DELETED,
                    planId,
                    ids: dels.map((d) => d.id),
                };
            },
        ),
};

export default serializeObjectOfPromiseFns(PlanApi) as typeof PlanApi;
