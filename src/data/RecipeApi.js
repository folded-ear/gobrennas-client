import BaseAxios from "axios";
import {
    API_BASE_URL,
    MAX_UPLOAD_BYTES,
} from "../constants/index";
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

const promiseWellSizedFile = fileOrString => new Promise((resolve, reject) => {
    if (fileOrString instanceof File && fileOrString.size > MAX_UPLOAD_BYTES) {
        // lifted from https://codepen.io/tuanitpro/pen/wJZJbp
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = function (e) {
            const img = document.createElement("img");
            img.onerror = reject;
            img.onload = function() {
                const canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                // Scale by total area, maintaining aspect ratio, aiming a
                // little low. If it's a PNG source, the JPG will end up _way_
                // smaller, but whatever.
                const factor = MAX_UPLOAD_BYTES / fileOrString.size * 0.9;
                const srcArea = img.width * img.height;
                const targetArea = Math.floor(srcArea * factor);
                const width = Math.floor(Math.sqrt(targetArea * img.width / img.height));
                const height = Math.floor(Math.sqrt(targetArea * img.height / img.width));

                canvas.width = width;
                canvas.height = height;
                ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(blob => {
                    let fn = fileOrString.name;
                    if (!fn.endsWith(".jpg")) {
                        fn += ".jpg";
                    }
                    resolve(new File([blob], fn));
                }, "image/jpeg");
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(fileOrString);
    } else {
        resolve(fileOrString);
    }
});

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
