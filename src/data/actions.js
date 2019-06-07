// import { toJSON } from 'immutable';
import Types from './types';
import Dispatcher from './dispatcher';
import axios from 'axios';
import Recipe from "../models/Recipe";
import PantryItem from "../models/PantryItem";
import user from './user';

const Actions = {
  
  user,

  selectRecipe(id) {
    Dispatcher.dispatch({
      type: Types.SELECT_RECIPE,
      id
    })
  },
  
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
      .delete(`/api/recipe/${id}`)
      .then(() => {
        Dispatcher.dispatch({
          type: Types.DELETE_RECIPE,
          id
        })
      })
  },
  
  fetchRecipes() {
    axios.get('/api/recipe/all')
      .then(res => {
        Dispatcher.dispatch({
          type: Types.FETCH_RECIPES,
          data: res.data
        })
      });
  },
  
  fetchPantryItems() {
    axios.get('/api/pantryitem/all')
      .then( res => {
        Dispatcher.dispatch({
          type: Types.FETCH_PANTRYITEMS,
          data: res.data
        })
      })
  },
  
  addPantryItem(item) {
    axios
      .post('/api/pantryitem', item.toJSON())
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