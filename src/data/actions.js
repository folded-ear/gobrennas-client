import Types from './types';
import Dispatcher from './dispatcher';

const Actions = {
  addRecipe(title) {
    Dispatcher.dispatch({
      type: Types.ADD_RECIPE,
      title,
    });
  }
};

export default Actions;