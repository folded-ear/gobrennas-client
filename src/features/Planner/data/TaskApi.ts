import BaseAxios from "axios";
import { client } from "@/providers/ApolloClient";
import { API_BASE_URL } from "@/constants";
import PlanActions from "@/features/Planner/data/PlanActions";
import promiseFlux, { soakUpUnauthorized } from "@/util/promiseFlux";
import serializeObjectOfPromiseFns from "@/util/serializeObjectOfPromiseFns";
import { CREATE_PLAN, REVOKE_PLAN_GRANT, SET_PLAN_GRANT } from "./mutations";
import { handleErrors, toRestPlan } from "./conversion_helpers";
import { GET_PLANS } from "@/data/hooks/useGetAllPlans";
import { LOAD_PLANS } from "@/features/Planner/data/queries";
import { BfsId, BfsStringId, ensureString } from "@/global/types/identity";
import AccessLevel from "@/data/AccessLevel";

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
};

export default serializeObjectOfPromiseFns(TaskApi);
