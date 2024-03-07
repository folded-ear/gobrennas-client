import BaseAxios from "axios";
import { API_BASE_URL } from "constants/index";
import PlanActions from "features/Planner/data/PlanActions";
import promiseFlux, { soakUpUnauthorized } from "util/promiseFlux";
import serializeObjectOfPromiseFns from "util/serializeObjectOfPromiseFns";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/tasks`,
});

const TaskApi = {
    createList: (name, clientId, fromId) =>
        promiseFlux(
            axios.post(`/`, {
                name,
                fromId,
            }),
            (data) => ({
                type: PlanActions.PLAN_CREATED,
                clientId,
                id: data.data.id,
                data: data.data,
                fromId,
            }),
        ),

    loadLists: () =>
        promiseFlux(
            axios.get(`/`),
            ({ data }) => ({
                type: PlanActions.PLANS_LOADED,
                data,
            }),
            soakUpUnauthorized,
        ),

    deleteList: (id) =>
        promiseFlux(axios.delete(`/${id}`), () => ({
            type: PlanActions.PLAN_DELETED,
            id,
        })),

    setListGrant: (id, userId, level) =>
        // i was not thinking when i designed this endpoint. :)
        promiseFlux(
            axios.post(`/${id}/acl/grants`, {
                userId,
                accessLevel: level,
            }),
            () => ({
                type: PlanActions.PLAN_GRANT_SET,
                id,
                userId,
            }),
        ),

    clearListGrant: (id, userId) =>
        promiseFlux(axios.delete(`/${id}/acl/grants/${userId}`), () => ({
            type: PlanActions.PLAN_GRANT_CLEARED,
            id,
            userId,
        })),

    getItemsUpdatedSince: (id, cutoff) =>
        promiseFlux(
            axios.get(`/${id}/all-since?p=${id}&cutoff=${cutoff}`),
            (r) => ({
                type: PlanActions.PLAN_DELTAS,
                id,
                data: r.data,
            }),
            soakUpUnauthorized,
        ),
};

export default serializeObjectOfPromiseFns(TaskApi);
