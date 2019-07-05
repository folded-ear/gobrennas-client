import Dispatcher from './dispatcher';
import BaseAxios from 'axios';
import RecipeActions from './RecipeActions';
import {API_BASE_URL} from "../constants/index";
import promiseFlux from "../util/promiseFlux";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
});

const RecipeApi = {
  
  selectRecipe(id) {
    Dispatcher.dispatch({
      type: RecipeActions.SELECT_RECIPE,
      id
    })
  },
  
  addRecipe(recipe) {
    axios
      .post('/recipe', recipe.toJSON())
      .then((response) => {
      //TODO: handle response back from API if there are errors, etc
      if (response.status && response.status === 201) {
        const { data } = response;

        Dispatcher.dispatch({
          type: RecipeActions.ADD_RECIPE,
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
          type: RecipeActions.DELETE_RECIPE,
          id
        })
      })
  },
  
  fetchRecipes() {
    axios.get('/recipe/all')
      .then(res => {
        Dispatcher.dispatch({
          type: RecipeActions.FETCH_RECIPES,
          data: res.data
        })
      });
  },

    addTasksFromRawIngredients(recipeId, listId) {
        promiseFlux(
            axios.post(`/recipe/${recipeId}/raw-ingredients/to-tasks/${listId}`),
            () => ({
                type: RecipeActions.RAW_INGREDIENTS_SENT_TO_TASK_LIST,
                recipeId,
                listId,
            }),
        );
    },

};

export default RecipeApi;