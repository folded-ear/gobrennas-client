import BaseAxios from "axios";
import { client } from "@/providers/ApolloClient";
import { API_BASE_URL } from "@/constants";
import PlanActions from "@/features/Planner/data/PlanActions";
import promiseFlux, { soakUpUnauthorized } from "@/util/promiseFlux";
import serializeObjectOfPromiseFns from "@/util/serializeObjectOfPromiseFns";
import { CREATE_PLAN } from "./mutations";
import { handleErrors, toRestPlan } from "./conversion_helpers";
import { GET_PLANS } from "@/data/hooks/useGetAllPlans";
import { LOAD_PLANS } from "@/features/Planner/data/queries";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/tasks`,
});

const TaskApi = {
    createList: (name, clientId, sourcePlanId) =>
        promiseFlux(
            client.mutate({
                mutation: CREATE_PLAN,
                variables: {
                    name,
                    sourcePlanId,
                },
                refetchQueries: [GET_PLANS],
            }),
            ({ data }) => {
                const plan = data?.planner?.createPlan || null;
                return (
                    plan && {
                        type: PlanActions.PLAN_CREATED,
                        clientId,
                        id: plan.id,
                        data: toRestPlan(plan),
                        fromId: sourcePlanId,
                    }
                );
            },
            handleErrors,
        ),

    loadLists: () =>
        promiseFlux(
            client.query({ query: LOAD_PLANS }),
            ({ data }) => ({
                type: PlanActions.PLANS_LOADED,
                data: data.planner.plans.map(toRestPlan),
            }),
            soakUpUnauthorized,
        ),

    deleteList: (id) => {
        client.cache.evict({ id });
        return promiseFlux(axios.delete(`/${id}`), () => {
            client.refetchQueries({ include: [GET_PLANS] });
            return {
                type: PlanActions.PLAN_DELETED,
                id,
            };
        });
    },

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
};

export default serializeObjectOfPromiseFns(TaskApi);
