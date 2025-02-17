import dispatcher, { ActionType } from "@/data/dispatcher";
import useActivePlanner from "@/data/useActivePlanner";
import useActiveShoppingPlanIds from "@/data/useActiveShoppingPlanIds";
import { toRestPlanOrItem } from "@/features/Planner/data/conversion_helpers";
import { toRestPantryItem } from "@/features/RecipeLibrary/data/conversion_helpers";
import { BfsId } from "@/global/types/identity";
import {
    client as apolloClient,
    compileDynamicGraphQLQuery,
} from "@/providers/ApolloClient";
import { useIsAuthenticated } from "@/providers/Profile";
import { soakUpUnauthorized } from "@/util/promiseFlux";
import * as React from "react";
import { useMemo } from "react";
import { useQuery } from "react-query";

/*
 * Unlike every other BFS query, this one is dynamically constructed at runtime
 * from the relevant plan IDs which need to stay in-sync. Normally IDs are
 * variables to static queries, but in this case, the structure of the query
 * itself varies based on the plan(s) which are active.
 */

const PANTRY_ITEM_TEMPLATE = `
updatedSince(cutoff: $cutoff) {
  ...ingredientLoad
  ...pantryItemLoad
}`;

const PLAN_PREFIX = `updatedSince(planId: `;

const PLAN_SUFFIX = `, cutoff: $cutoff) {
  ...corePlanItemLoad
  ...planLoad
  ...planItemLoad
}`;

type Syncer = (cutoff: number) => Promise<unknown>;

function buildSyncer(planIds: BfsId[]): Syncer {
    const parts = [
        `query pollForUpdates($cutoff: Long!) {`,
        `pantry { ${PANTRY_ITEM_TEMPLATE} }`,
    ];
    if (planIds.length) {
        parts.push("planner {");
        for (const id of planIds) {
            parts.push(`p${id}: ${PLAN_PREFIX}${id}${PLAN_SUFFIX}`);
        }
        parts.push("}");
    }
    parts.push("}");
    const query = compileDynamicGraphQLQuery(parts.join("\n"));
    return (cutoff) =>
        apolloClient
            .query({
                query,
                variables: {
                    cutoff,
                },
                fetchPolicy: "network-only",
            })
            .then(({ data }) => {
                // BE CAREFUL! Dynamic query means 'data' is type `any`!
                const updates = data.pantry.updatedSince;
                if (updates.length) {
                    dispatcher.dispatch({
                        type: ActionType.LIBRARY__INGREDIENTS_LOADED,
                        data: updates.map(toRestPantryItem),
                    });
                }
                for (const id of planIds) {
                    const updates = data.planner[`p${id}`];
                    if (updates.length) {
                        dispatcher.dispatch({
                            type: ActionType.PLAN__PLAN_DELTAS,
                            id,
                            data: updates.map(toRestPlanOrItem),
                        });
                    }
                }
            }, soakUpUnauthorized);
}

function useSynchronizer(queryKey: unknown[], queryFn: Syncer) {
    const [cutoff, setCutoff] = React.useState(Date.now());
    const authenticated = useIsAuthenticated();
    useQuery(
        queryKey,
        () => {
            if (!authenticated) return Promise.reject();
            const nextTs = Date.now();
            return queryFn(cutoff).then((data) => {
                // this may double-retrieve changes, but won't MISS any.
                setCutoff((ts) => (ts < Date.now() ? nextTs : ts));
                return data;
            });
        },
        {
            refetchInterval: 15_000,
            refetchIntervalInBackground: false,
        },
    );
}

function PollingSynchronizer() {
    let planIds = useActiveShoppingPlanIds();
    const plan = useActivePlanner().data;
    if (plan?.id != null && !planIds.includes(plan.id)) {
        planIds = planIds.concat(plan.id);
    }
    planIds.sort();

    const queryFn: Syncer = useMemo(
        () => buildSyncer(planIds),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [planIds.join()],
    );

    useSynchronizer(["poll-for-updates"], queryFn);
    return null;
}

export default function PollingSynchronizerAuthCheck() {
    return useIsAuthenticated() ? <PollingSynchronizer /> : null;
}
