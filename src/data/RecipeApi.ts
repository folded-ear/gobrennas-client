import BaseAxios from "axios";
import promiseFlux from "@/util/promiseFlux";
import { API_BASE_URL } from "@/constants";
import RecipeActions from "./RecipeActions";
import { BfsId, UserType } from "@/global/types/identity";
import { Maybe } from "graphql/jsutils/Maybe";
import { Ingredient, ShareInfo } from "@/global/types/types";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/recipe`,
});

const RecipeApi = {
    sendToPlan(recipeId: BfsId, planId: BfsId, scale: Maybe<number>) {
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
        );
    },

    promiseShareInfo: (id: BfsId) =>
        axios.get(`/${id}/share`).then(({ data }) => data as ShareInfo),

    promiseSharedRecipe: (
        slug: ShareInfo["slug"],
        secret: ShareInfo["secret"],
        id: ShareInfo["id"],
    ) =>
        BaseAxios.get(
            `${API_BASE_URL}/shared/recipe/${slug}/${secret}/${id}.json`,
        ).then(
            ({ data }) =>
                [data.owner, data.ingredients] as [UserType, Ingredient[]],
        ),
};

export default RecipeApi;
