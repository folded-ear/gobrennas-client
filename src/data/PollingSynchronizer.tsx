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
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useMemo } from "react";

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
    const parts = [`pantry { ${PANTRY_ITEM_TEMPLATE} }`];
    const variables: Record<string, BfsId> = {};
    if (planIds.length) {
        parts.push("planner {");
        planIds.forEach((id, i) => {
            const v = "id" + i;
            variables[v] = id;
            parts.push(`p${i}: ${PLAN_PREFIX}$${v}${PLAN_SUFFIX}`);
        });
        parts.push("}");
    }
    parts.unshift(
        `query pollForUpdates($cutoff: Long!${Object.keys(variables)
            .map((v) => `$${v}: ID!`)
            .join("")}) {`,
    );
    parts.push("}");
    const query = compileDynamicGraphQLQuery(parts.join("\n"));
    return (cutoff) =>
        apolloClient
            .query({
                query,
                variables: {
                    ...variables,
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
                planIds.forEach((id, i) => {
                    const updates = data.planner[`p${i}`];
                    if (updates.length) {
                        dispatcher.dispatch({
                            type: ActionType.PLAN__PLAN_DELTAS,
                            id,
                            data: updates.map(toRestPlanOrItem),
                        });
                    }
                });
                return 0; // have to give _something_ to react-query to cache
            }, soakUpUnauthorized);
}

function useSynchronizer(queryKey: unknown[], queryFn: Syncer) {
    const [cutoff, setCutoff] = React.useState(Date.now());
    const authenticated = useIsAuthenticated();
    useQuery({
        queryKey: queryKey,
        queryFn: () => {
            if (!authenticated) return Promise.reject();
            const nextTs = Date.now();
            return queryFn(cutoff).then((data) => {
                // this may double-retrieve changes, but won't MISS any.
                setCutoff((ts) => (ts < Date.now() ? nextTs : ts));
                return data;
            });
        },
        refetchOnWindowFocus: true,
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
    });
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
