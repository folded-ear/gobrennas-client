import Types from './types';
import Dispatcher from './dispatcher';
import axios from 'axios';

const Actions = {
  addRecipe(title) {
    Dispatcher.dispatch({
      type: Types.ADD_RECIPE,
      title,
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