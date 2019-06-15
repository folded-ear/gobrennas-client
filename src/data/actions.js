// import { toJSON } from 'immutable';
import Types from './types';
import Dispatcher from './dispatcher';
import BaseAxios from 'axios';
import Recipe from "../models/Recipe";
import PantryItem from "../models/PantryItem";
import { API_BASE_URL } from "../constants/index";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api`,
});

const Actions = {
  
  selectRecipe(id) {
    Dispatcher.dispatch({
      type: Types.SELECT_RECIPE,
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
          type: Types.ADD_RECIPE,
          data: new Recipe({
            id: recipe.id,
            type: "Recipe",
            title: recipe.title,
            external_url: recipe.external_url,
            ingredients: [],
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
          type: Types.DELETE_RECIPE,
          id
        })
      })
  },
  
  fetchRecipes() {
    axios.get('/recipe/all')
      .then(res => {
        Dispatcher.dispatch({
          type: Types.FETCH_RECIPES,
          data: res.data
        })
      });
  },
  
  fetchPantryItems() {
    axios.get('/pantryitem/all')
      .then( res => {
        Dispatcher.dispatch({
          type: Types.FETCH_PANTRYITEMS,
          data: res.data
        })
      })
  },
  
  addPantryItem(item) {
    axios
      .post('/pantryitem', item.toJSON())
      .then( response => {
        // TODO: Add error handling and logging
        if(response.status && response.status === 201) {
          const { data: item} = response;
          
          Dispatcher.dispatch({
            type: Types.ADD_PANTRYITEM,
            data: new PantryItem({
              id: item.ingredientId,
              name: item.name,
              aisle: item.aisle
            })
          })
        }
      })
  }
};

export default Actions;