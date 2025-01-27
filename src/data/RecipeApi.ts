import BaseAxios from "axios";
import promiseFlux from "@/util/promiseFlux";
import { API_BASE_URL } from "@/constants";
import RecipeActions from "./RecipeActions";
import { BfsId } from "@/global/types/identity";
import { Maybe } from "graphql/jsutils/Maybe";
import { ShareInfo } from "@/global/types/types";

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
};

export default RecipeApi;
