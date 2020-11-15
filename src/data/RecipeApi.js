import BaseAxios from "axios";
import { API_BASE_URL } from "../constants/index";
import promiseFlux from "../util/promiseFlux";
import RecipeActions from "./RecipeActions";

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
        let recipeData = build(recipe);
        promiseFlux(
            BaseAxios.create({
                baseURL: `${API_BASE_URL}/api`,
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }).post("/recipe", recipeData),
            data => ({
                type: RecipeActions.RECIPE_CREATED,
                id, // need this for translation
                data: data.data,
            })
        );
    },
    
    updateRecipe(recipe) {
        promiseFlux(
            axios.put(`/recipe/${recipe.id}`, build(recipe)),
            data => ({
                type: RecipeActions.RECIPE_UPDATED,
                id: recipe.id,
                data: data.data,
            })
        );
    },

    setRecipePhoto(id, photo) {
        let payload = new FormData();
        payload.append("photo", photo);
        promiseFlux(
            axios.put(`/recipe/${id}/photo`, payload),
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
            axios.post(`/recipe/${recipeId}/_actions`, {
                type: "SEND_TO_PLAN",
                planId,
            }),
            () => ({
                type: RecipeActions.SENT_TO_PLAN,
                recipeId,
                planId,
            }),
        );
    },

    recognizeItem(raw, cursorPosition = raw.length) {
        return axios.post(`/recipe/_actions`, {
            type: "RECOGNIZE_ITEM",
            raw,
            cursorPosition,
        }).then(
            data => data.data
        );
    },
    
    recordIngredientDissection(raw, quantity, units, name, prep) {
        promiseFlux(
            axios.post(`/recipe/_actions`, {
                type: "DISSECT_RAW_INGREDIENT",
                dissection: {
                    raw,
                    quantity,
                    units,
                    name,
                    prep,
                },
            }),
            () => ({
                type: RecipeActions.DISSECTION_RECORDED,
                raw,
            }),
        );
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
