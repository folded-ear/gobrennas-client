import BaseAxios from 'axios'
import RecipeActions from './RecipeActions'
import { API_BASE_URL } from "../constants/index"
import promiseFlux from "../util/promiseFlux"

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
})

const RecipeApi = {
    
    addRecipe(recipe) {
        // save this for later
        const id = recipe.id
        recipe = {...recipe}
        // the clientId gives the server grief
        delete recipe.id
        promiseFlux(
            axios.post('/recipe', recipe),
            data => ({
                type: RecipeActions.RECIPE_CREATED,
                id, // need this for translation
                data: data.data,
            })
        )
    },
    
    updateRecipe(recipe) {
        promiseFlux(
            axios.put(`/recipe/${recipe.id}`, recipe),
            data => ({
                type: RecipeActions.RECIPE_UPDATED,
                id: recipe.id,
                data: data.data,
            })
        )
    },
    
    deleteRecipe(id) {
        promiseFlux(
            axios.delete(`/recipe/${id}`),
            () => ({
                type: RecipeActions.RECIPE_DELETED,
                id
            })
        )
    },
    
    assembleShoppingList(recipeIds, listId) {
        promiseFlux(
            axios.post(`/recipe/${recipeIds[0]}/_actions`, {
                type: "ASSEMBLE_SHOPPING_LIST",
                additionalRecipeIds: recipeIds.slice(1),
                listId,
            }),
            () => ({
                type: RecipeActions.SHOPPING_LIST_ASSEMBLED,
                recipeIds,
                listId,
            }),
        )
    },

    sendToShoppingList(recipeId, listId) {
        promiseFlux(
            axios.post(`/recipe/${recipeId}/_actions`, {
                type: "SEND_TO_SHOPPING_LIST",
                listId,
            }),
            () => ({
                type: RecipeActions.SHOPPING_LIST_SENT,
                recipeId,
                listId,
            }),
        )
    },

    recognizeElement(raw) {
        return axios.post(`/recipe/_actions`, {
            type: "RECOGNIZE_ELEMENT",
            rawElement: raw,
        }).then(
            data => data.data
        )
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
        )
    },

    addLabel(id, label) {
        promiseFlux(
            // this endpoint wants a plain-text post body containing the label
            axios.post(`/recipe/${id}/labels`, label, {
                headers: { 'Content-Type': 'text/plain' }
            }),
            () => ({
                type: RecipeActions.LABEL_ADDED,
                id,
                label,
            }),
        )
    },

    removeLabel(id, label) {
        promiseFlux(
            axios.delete(`/recipe/${id}/labels/${encodeURIComponent(label)}`),
            () => ({
                type: RecipeActions.LABEL_REMOVED,
                id,
                label,
            }),
        )
    },
}

export default RecipeApi
