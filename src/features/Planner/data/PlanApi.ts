import BaseAxios from "axios";
import { API_BASE_URL } from "@/constants";
import promiseFlux from "@/util/promiseFlux";
import PlanActions from "./PlanActions";
import { client } from "@/providers/ApolloClient";
import {
    ASSIGN_BUCKET,
    CREATE_BUCKET,
    DELETE_BUCKET,
    DELETE_BUCKETS,
    DELETE_PLAN_ITEM,
    RENAME_PLAN_OR_ITEM,
    SET_PLAN_COLOR,
    SET_PLAN_ITEM_STATUS,
    UPDATE_BUCKET,
} from "@/features/Planner/data/mutations";
import {
    handleErrors,
    toRestPlan,
    toRestPlanItem,
    toRestPlanOrItem,
} from "@/features/Planner/data/conversion_helpers";
import { BfsId, ensureString } from "@/global/types/identity";
import { PlanBucket } from "./planStore";
import serializeObjectOfPromiseFns from "@/util/serializeObjectOfPromiseFns";
import { LOAD_DESCENDANTS } from "@/features/Planner/data/queries";
import { willStatusDelete } from "@/features/Planner/data/PlanItemStatus";
import { StatusChange } from "@/features/Planner/data/utils";
import { formatLocalDate, parseLocalDate } from "@/util/time";
import { Maybe } from "graphql/jsutils/Maybe";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/plan`,
});

interface WireBucket extends Omit<PlanBucket, "date"> {
    date: Maybe<string>;
}

function deserializeBucket(b: WireBucket): PlanBucket {
    return { ...b, date: parseLocalDate(b.date) };
}

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

    mutateTree: (planId: BfsId, body) =>
        axios.post(`/${planId}/mutate-tree`, body),

    assignBucket: (id: BfsId, bucketId: BfsId | null) =>
        client.mutate({
            mutation: ASSIGN_BUCKET,
            variables: {
                id: ensureString(id),
                bucketId: bucketId == null ? null : ensureString(bucketId),
            },
        }),

    reorderSubitems: (id: BfsId, subitemIds: BfsId[]) =>
        axios.post(`/${id}/reorder-subitems`, {
            id,
            subitemIds,
        }),

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

    deleteBucket: (planId: BfsId, id: BfsId) =>
        promiseFlux(
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
        ),

    deleteBuckets: (planId: BfsId, ids: BfsId[]) =>
        promiseFlux(
            client.mutate({
                mutation: DELETE_BUCKETS,
                variables: {
                    planId: ensureString(planId),
                    bucketIds: ids.map((id) => ensureString(id)),
                },
            }),
            ({ data }) => {
                const dels = data?.planner?.deleteBuckets || [];
                return {
                    type: PlanActions.BUCKETS_DELETED,
                    planId,
                    ids: dels.map((d) => d.id),
                };
            },
        ),
};

export default serializeObjectOfPromiseFns(PlanApi);
