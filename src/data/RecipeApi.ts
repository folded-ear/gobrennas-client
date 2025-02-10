import { ActionType } from "@/data/dispatcher";
import { SEND_RECIPE_TO_PLAN } from "@/data/mutations";
import { GET_RECIPE_SHARE_INFO } from "@/data/queries";
import {
    toRestPlanItem,
    toRestPlanOrItem,
} from "@/features/Planner/data/conversion_helpers";
import { BfsId, ensureString } from "@/global/types/identity";
import { ShareInfo } from "@/global/types/types";
import { client } from "@/providers/ApolloClient";
import promiseFlux from "@/util/promiseFlux";
import { Maybe } from "graphql/jsutils/Maybe";

const RecipeApi = {
    sendToPlan: (recipeId: BfsId, planId: BfsId, scale: Maybe<number>) =>
        promiseFlux(
            client.mutate({
                mutation: SEND_RECIPE_TO_PLAN,
                variables: {
                    id: ensureString(recipeId),
                    planId: ensureString(planId),
                    scale,
                },
            }),
            ({ data }) => {
                const result = data!.library.sendRecipeToPlan;
                return {
                    type: ActionType.RECIPE__SENT_TO_PLAN,
                    recipeId,
                    planId,
                    data: [
                        toRestPlanOrItem(result.parent),
                        toRestPlanItem(result),
                    ].concat(result.descendants.map(toRestPlanItem)),
                };
            },
            () => ({
                type: ActionType.RECIPE__ERROR_SENDING_TO_PLAN,
                recipeId,
                planId,
            }),
        ),

    promiseShareInfo: (id: BfsId) =>
        client
            .query({
                query: GET_RECIPE_SHARE_INFO,
                variables: {
                    id: ensureString(id),
                },
            })
            .then(({ data }) => data.library.getRecipeById.share as ShareInfo),
};

export default RecipeApi;
