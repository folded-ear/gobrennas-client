import BaseAxios from "axios";
import queryClient from "data/queryClient";
import promiseFlux from "util/promiseFlux";
import { API_BASE_URL } from "../constants/index";
import RecipeActions from "./RecipeActions";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
});

const RecipeApi = {
    deleteRecipe(id) {
        promiseFlux(axios.delete(`/recipe/${id}`), () => ({
            type: RecipeActions.RECIPE_DELETED,
            id,
        }));
    },

    sendToPlan(recipeId, planId, scale) {
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
