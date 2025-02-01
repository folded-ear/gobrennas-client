import promiseFlux from "@/util/promiseFlux";
import RecipeActions from "./RecipeActions";
import { BfsId, ensureString } from "@/global/types/identity";
import { Maybe } from "graphql/jsutils/Maybe";
import { ShareInfo } from "@/global/types/types";
import { client } from "@/providers/ApolloClient";
import { GET_RECIPE_SHARE_INFO } from "@/data/queries";
import {
    toRestPlanItem,
    toRestPlanOrItem,
} from "@/features/Planner/data/conversion_helpers";
import { SEND_RECIPE_TO_PLAN } from "@/data/mutations";

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
                    type: RecipeActions.SENT_TO_PLAN,
                    recipeId,
                    planId,
                    data: [
                        toRestPlanOrItem(result.parent),
                        toRestPlanItem(result),
                    ].concat(result.descendants.map(toRestPlanItem)),
                };
            },
            () => ({
                type: RecipeActions.ERROR_SENDING_TO_PLAN,
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
