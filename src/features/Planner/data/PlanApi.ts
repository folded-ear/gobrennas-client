import BaseAxios from "axios";
import { API_BASE_URL } from "constants/index";
import promiseFlux from "util/promiseFlux";
import PlanActions from "./PlanActions";
import { client } from "providers/ApolloClient";
import {
    CREATE_BUCKET,
    DELETE_BUCKET,
    DELETE_PLAN_ITEM,
    RENAME_PLAN_ITEM,
    UPDATE_BUCKET,
} from "./mutations";
import type {
    CreateBucketMutation,
    DeleteBucketMutation,
    DeletePlanItemMutation,
    RenamePlanItemMutation,
    UpdateBucketMutation,
} from "__generated__/graphql";
import type { FetchResult } from "@apollo/client";
import {
    handleErrors,
    toRestPlanItem,
} from "features/Planner/data/conversion_helpers";
import { ensureInt } from "global/utils";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/plan`,
});

const PlanApi = {
    createItem: (planId, body) =>
        promiseFlux(axios.post(`/${planId}`, body), (r) => ({
            type: PlanActions.TREE_CREATE,
            data: r.data.info,
            newIds: r.data.newIds,
        })),

    renameItem: (id: number, name: string) =>
        promiseFlux(
            client.mutate({
                mutation: RENAME_PLAN_ITEM,
                variables: {
                    id: id.toString(),
                    name,
                },
            }),
            (result: FetchResult<RenamePlanItemMutation>) => {
                const planItem = result?.data?.planner?.rename || null;
                return {
                    type: PlanActions.UPDATED,
                    data: planItem && toRestPlanItem(planItem),
                };
            },
            handleErrors,
        ),

    deleteItem: (id: number) =>
        promiseFlux(
            client.mutate({
                mutation: DELETE_PLAN_ITEM,
                variables: {
                    id: id.toString(),
                },
            }),
            (result: FetchResult<DeletePlanItemMutation>) => {
                const id = result?.data?.planner?.deleteItem?.id || null;
                return (
                    id && {
                        type: PlanActions.DELETED,
                        id: ensureInt(id),
                    }
                );
            },
            handleErrors,
        ),

    updateItemStatus: (planId, body) =>
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

    mutateTree(planId, body) {
        axios.post(`/${planId}/mutate-tree`, body);
    },

    assignBucket(planId, id, bucketId) {
        axios.post(`/${planId}/assign-bucket`, {
            id,
            bucketId,
        });
    },

    reorderSubitems(id, subitemIds) {
        axios.post(`/${id}/reorder-subitems`, {
            id,
            subitemIds,
        });
    },

    getDescendantsAsList: (id) =>
        promiseFlux(axios.get(`/${id}/descendants`), (r) => ({
            type: PlanActions.PLAN_DATA_BOOTSTRAPPED,
            id,
            data: r.data,
        })),

    createBucket: (planId: number, variables) =>
        promiseFlux(
            client.mutate({
                mutation: CREATE_BUCKET,
                variables: {
                    planId: planId.toString(),
                    name: variables.name,
                    date: variables.date,
                },
            }),
            (result: FetchResult<CreateBucketMutation>) => {
                const bucket = result?.data?.planner?.createBucket || null;
                return (
                    bucket && {
                        type: PlanActions.BUCKET_CREATED,
                        planId,
                        data: {
                            id: ensureInt(bucket.id),
                            name: bucket.name,
                            date: bucket.date,
                        },
                    }
                );
            },
            handleErrors,
        ),

    updateBucket: (planId: number, id: number, variables) =>
        promiseFlux(
            client.mutate({
                mutation: UPDATE_BUCKET,
                variables: {
                    planId: planId.toString(),
                    bucketId: id.toString(),
                    name: variables.name,
                    date: variables.date,
                },
            }),
            (result: FetchResult<UpdateBucketMutation>) => {
                const bucket = result?.data?.planner?.updateBucket || null;
                console.log(result);
                return (
                    bucket && {
                        type: PlanActions.BUCKET_UPDATED,
                        planId,
                        data: {
                            id: ensureInt(bucket.id),
                            name: bucket.name,
                            date: bucket.date,
                        },
                    }
                );
            },
        ),

    deleteBucket: (planId: number, id: number) =>
        promiseFlux(
            client.mutate({
                mutation: DELETE_BUCKET,
                variables: {
                    planId: planId.toString(),
                    bucketId: id.toString(),
                },
            }),
            (result: FetchResult<DeleteBucketMutation>) => {
                const bucket = result?.data?.planner?.deleteBucket || null;
                console.log(result);
                return (
                    bucket && {
                        type: PlanActions.BUCKET_DELETED,
                        planId,
                        id: ensureInt(bucket.id),
                    }
                );
            },
        ),
};

export default PlanApi;
