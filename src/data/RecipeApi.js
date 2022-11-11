import BaseAxios from "axios";
import { API_BASE_URL } from "../constants/index";
import promiseFlux from "util/promiseFlux";
import promiseWellSizedFile from "util/promiseWellSizedFile";
import RecipeActions from "./RecipeActions";
import queryClient from "data/queryClient";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
});

function build(recipe) {
    let recipeData = new FormData();
    const info = {...recipe};
    delete info.photo;
    recipeData.append("info", JSON.stringify(info));
    if(recipe.photo) {
        recipeData.append("photo", recipe.photo);
    }
    return recipeData;
}

const RecipeApi = {
    
    addRecipe(recipe) {
        const id = recipe.id;
        delete recipe.id;
        promiseFlux(
            promiseWellSizedFile(recipe.photo).then(photo =>
                axios.post("/recipe", build({
                    ...recipe,
                    photo,
                }))),
            data => ({
                type: RecipeActions.RECIPE_CREATED,
                id, // need this for translation
                data: data.data,
            })
        );
    },
    
    updateRecipe(recipe) {
        promiseFlux(
            promiseWellSizedFile(recipe.photo).then(photo =>
                axios.put(`/recipe/${recipe.id}`, build({
                    ...recipe,
                    photo,
                }))),
            data => ({
                type: RecipeActions.RECIPE_UPDATED,
                id: recipe.id,
                data: data.data,
            })
        );
    },

    setRecipePhoto(id, photo) {
        if (!(photo instanceof File)) {
            throw new Error("Non-File photo? Huh?");
        }
        promiseFlux(
            promiseWellSizedFile(photo).then(p => {
                let payload = new FormData();
                payload.append("photo", p);
                return axios.put(`/recipe/${id}/photo`, payload);
            }),
            data => ({
                type: RecipeActions.RECIPE_UPDATED,
                id,
                data: data.data,
            })
        );
    },
    
    deleteRecipe(id) {
        promiseFlux(
            axios.delete(`/recipe/${id}`),
            () => ({
                type: RecipeActions.RECIPE_DELETED,
                id
            })
        );
    },
    
    sendToPlan(recipeId, planId) {
        promiseFlux(
            axios.post(`/recipe/${recipeId}/_send_to_plan/${planId}`),
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
            queryClient.invalidateQueries([ "plan", planId, "items" ]));
    },

    addLabel(id, label) {
        promiseFlux(
            // this endpoint wants a plain-text post body containing the label
            axios.post(`/recipe/${id}/labels`, label, {
                headers: { "Content-Type": "text/plain" }
            }),
            () => ({
                type: RecipeActions.LABEL_ADDED,
                id,
                label,
            }),
        );
    },

    removeLabel(id, label) {
        promiseFlux(
            axios.delete(`/recipe/${id}/labels/${encodeURIComponent(label)}`),
            () => ({
                type: RecipeActions.LABEL_REMOVED,
                id,
                label,
            }),
        );
    },
};

export default RecipeApi;
