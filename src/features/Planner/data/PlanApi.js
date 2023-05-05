import BaseAxios from "axios";
import { API_BASE_URL } from "constants/index";
import promiseFlux, { soakUpUnauthorized } from "util/promiseFlux";
import PlanActions from "./PlanActions";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/plan`,
});

const PlanApi = {
    createItem: (planId, body) =>
        promiseFlux(
            axios.post(`/${planId}`, body),
            r => ({
                type: PlanActions.TREE_CREATE,
                data: r.data.info,
                newIds: r.data.newIds,
            }),
        ),

    renameItem: (planId, body) =>
        promiseFlux(
            axios.put(`/${planId}/rename`, body),
            r => ({
                type: PlanActions.UPDATED,
                data: r.data.info,
            }),
        ),

    deleteItem: (planId, id) =>
        promiseFlux(
            axios.delete(`/${planId}/${id}`),
            () => ({
                type: PlanActions.DELETED,
                id,
            }),
        ),

    updateItemStatus: (planId, body) =>
        promiseFlux(
            axios.put(`/${planId}/status`, body),
            r => r.data.type === "delete"
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
        axios.post(
            `/${id}/reorder-subitems`,
            {
                id,
                subitemIds,
            },
        );
    },

    getDescendantsAsList: id =>
        promiseFlux(
            axios.get(`/${id}/descendants`),
            r => ({
                type: PlanActions.PLAN_DATA_BOOTSTRAPPED,
                id,
                data: r.data,
            }),
        ),

    getItemsUpdatedSince: (id, cutoff) =>
        promiseFlux(
            axios.get(`/${id}/all-since?cutoff=${cutoff}`),
            r => ({
                type: PlanActions.PLAN_DELTAS,
                id,
                data: r.data,
            }),
            soakUpUnauthorized,
        ),

    createBucket: (planId, body) =>
        promiseFlux(
            axios.post(`/${planId}/buckets`, body),
            ({ data }) => ({
                type: PlanActions.BUCKET_CREATED,
                planId,
                data: data.info,
                oldId: data.newIds[data.id],
            }),
        ),

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
        promiseFlux(
            axios.delete(`/${planId}/buckets/${id}`),
            ({ data }) => ({
                type: PlanActions.BUCKET_DELETED,
                planId,
                id: data.id,
            }),
        ),
};

export default PlanApi;
