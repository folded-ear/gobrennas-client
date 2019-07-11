import Dispatcher from './dispatcher';
import BaseAxios from 'axios';
import RecipeActions from './RecipeActions';
import { API_BASE_URL } from "../constants/index";
import promiseFlux from "../util/promiseFlux";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
});

const RecipeApi = {
  
  addRecipe(recipe) {
    axios
      .post('/recipe', recipe.toJSON())
      .then((response) => {
      //TODO: handle response back from API if there are errors, etc
      if (response.status && response.status === 201) {
        const { data } = response;

        Dispatcher.dispatch({
          type: RecipeActions.RECIPE_CREATED,
          data,
        });
      }
    });
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
    
    addTasksFromIngredients(recipeId, listId) {
        promiseFlux(
            axios.post(`/recipe/${recipeId}/_actions`, {
                type: "ASSEMBLE_SHOPPING_LIST",
                listId,
            }),
            () => ({
                type: RecipeActions.INGREDIENTS_SENT_TO_TASK_LIST,
                recipeId,
                listId,
            }),
        );
    },

};

export default RecipeApi;