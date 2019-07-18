import BaseAxios from 'axios'
import RecipeActions from './RecipeActions'
import { API_BASE_URL } from "../constants/index"
import promiseFlux from "../util/promiseFlux"

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
})

const RecipeApi = {
    
    addRecipe(recipe) {
        promiseFlux(
            axios.post('/recipe', recipe),
            () => ({
                type: RecipeActions.RECIPE_CREATED
            })
        )
    },
    
    updateRecipe(recipe) {
        promiseFlux(
            axios.put(`/recipe/${recipe.id}`, recipe),
            data => ({
                type: RecipeActions.RECIPE_UPDATED,
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
    
    assembleShoppingList(recipeId, listId) {
        promiseFlux(
            axios.post(`/recipe/${recipeId}/_actions`, {
                type: "ASSEMBLE_SHOPPING_LIST",
                listId,
            }),
            () => ({
                type: RecipeActions.SHOPPING_LIST_ASSEMBLED,
                recipeId,
                listId,
            }),
        )
    },
    
    recordIngredientDissection(recipeId, raw, quantity, units, name, prep) {
        promiseFlux(
            axios.post(`/recipe/${recipeId}/_actions`, {
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
                recipeId,
                raw,
            }),
        )
    }
    
}

export default RecipeApi