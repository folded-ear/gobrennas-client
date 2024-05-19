import BaseAxios from "axios";
import { API_BASE_URL } from "constants/index";
import promiseFlux from "util/promiseFlux";
import PlanActions from "./PlanActions";
import { client } from "providers/ApolloClient";
import { DELETE_PLAN_ITEM, RENAME_PLAN_ITEM } from "./mutations";
import type {
    DeletePlanItemMutation,
    RenamePlanItemMutation,
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

    renameItem: (planId, name) =>
        promiseFlux(
            client.mutate({
                mutation: RENAME_PLAN_ITEM,
                variables: {
                    id: planId,
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

    deleteItem: (planId: number) =>
        promiseFlux(
            client.mutate({
                mutation: DELETE_PLAN_ITEM,
                variables: {
                    id: planId.toString(),
                },
            }),
            (result: FetchResult<DeletePlanItemMutation>) => {
                const planId = result?.data?.planner?.deleteItem?.id || null;
                return (
                    planId && {
                        type: PlanActions.DELETED,
                        id: ensureInt(planId),
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

    createBucket: (planId, body) =>
        promiseFlux(axios.post(`/${planId}/buckets`, body), ({ data }) => ({
            type: PlanActions.BUCKET_CREATED,
            planId,
            data: data.info,
            oldId: data.newIds[data.id],
        })),

    updateBucket: (planId, id, body) =>
        promiseFlux(
            axios.put(`/${planId}/buckets/${id}`, body),
            ({ data }) => ({
                type: PlanActions.BUCKET_UPDATED,
                planId,
                data: data.info,
            }),
        ),

    deleteBucket: (planId, id) =>
        promiseFlux(axios.delete(`/${planId}/buckets/${id}`), ({ data }) => ({
            type: PlanActions.BUCKET_DELETED,
            planId,
            id: data.id,
        })),
};

export default PlanApi;
