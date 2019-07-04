import Dispatcher from './dispatcher';
import BaseAxios from 'axios';
import RecipeActions from './RecipeActions';
import Recipe from "../models/Recipe";
import { API_BASE_URL } from "../constants/index";

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
        const {data: recipe} = response;

        Dispatcher.dispatch({
          type: RecipeActions.ADD_RECIPE,
          data: new Recipe({
            id: recipe.id,
            type: "Recipe",
            title: recipe.title,
            externalUrl: recipe.externalUrl,
            ingredients: [],
            rawIngredients: recipe.rawIngredients,
            directions: recipe.directions
          }),
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
  }
};

export default RecipeApi;