import BaseAxios from "axios";
import queryClient from "@/data/queryClient";
import promiseFlux from "@/util/promiseFlux";
import { API_BASE_URL } from "@/constants";
import RecipeActions from "./RecipeActions";
import { BfsId } from "@/global/types/identity";
import { Maybe } from "graphql/jsutils/Maybe";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
});

const RecipeApi = {
    sendToPlan(recipeId: BfsId, planId: BfsId, scale: Maybe<number>) {
        promiseFlux(
            axios.post(
                `/recipe/${recipeId}/_send_to_plan/${planId}?scale=${
                    scale || 1
                }`,
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
        ).finally(() =>
            queryClient.invalidateQueries(["plan", planId, "items"]),
        );
    },
};

export default RecipeApi;
