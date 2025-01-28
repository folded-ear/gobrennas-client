import BaseAxios from "axios";
import promiseFlux from "@/util/promiseFlux";
import { API_BASE_URL } from "@/constants";
import RecipeActions from "./RecipeActions";
import { BfsId, ensureString } from "@/global/types/identity";
import { Maybe } from "graphql/jsutils/Maybe";
import { ShareInfo } from "@/global/types/types";
import { client } from "@/providers/ApolloClient";
import { GET_RECIPE_SHARE_INFO } from "@/data/queries";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
});

const RecipeApi = {
    sendToPlan: (recipeId: BfsId, planId: BfsId, scale: Maybe<number>) =>
        promiseFlux(
            axios.post(
                `/${recipeId}/_send_to_plan/${planId}?scale=${scale || 1}`,
            ),
            () => ({
                type: RecipeActions.SENT_TO_PLAN,
                recipeId,
                planId,
            }),
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
