// import { toJSON } from 'immutable';
import Types from './types';
import Dispatcher from './dispatcher';
import axios from 'axios';
import Recipe from "../models/Recipe";

const Actions = {
  addRecipe(recipe) {
    axios
      .post('/api/recipe', recipe.toJSON())
      .then((response) => {
      //TODO: handle response back from API if there are errors, etc
      if (response.status && response.status === 201) {
        const {data: recipe} = response;

        Dispatcher.dispatch({
          type: Types.ADD_RECIPE,
          data: new Recipe({
            id: recipe.id,
            title: recipe.title,
            external_url: recipe.external_url,
            ingredients: recipe.ingredients,
            directions: recipe.directions
          }),
        });
      }
    });
  },
  
  fetchRecipes() {
    axios.get('/api/recipe/all')
      .then(res => {
        Dispatcher.dispatch({
          type: Types.FETCH_RECIPES,
          data: res.data
        })
      });
  }
};

export default Actions;