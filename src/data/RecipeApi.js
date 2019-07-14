import Dispatcher from './dispatcher'
import BaseAxios from 'axios'
import RecipeActions from './RecipeActions'
import { API_BASE_URL } from "../constants/index"
import promiseFlux from "../util/promiseFlux"

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
})

const RecipeApi = {
    
    addRecipe(recipe) {
        axios
            .post('/recipe', recipe.toJSON())
            .then((response) => {
                //TODO: handle response back from API if there are errors, etc
                if (response.status && response.status === 201) {
                    Dispatcher.dispatch({
                        type: RecipeActions.RECIPE_CREATED
                    })
                }
            })
    },
    
    updateRecipe(recipe) {
        axios
            .put(`/recipe/${recipe.id}`, recipe.toJSON())
            .then((response) => {
                if (response.status && response.status === 200) {
                    Dispatcher.dispatch({
                        type: RecipeActions.RECIPE_UPDATED
                    })
                }
            })
    },
    
    
    deleteRecipe(id) {
        axios
            .delete(`/recipe/${id}`)
            .then(() => {
                Dispatcher.dispatch({
                    type: RecipeActions.RECIPE_DELETED,
                    id
                })
            })
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