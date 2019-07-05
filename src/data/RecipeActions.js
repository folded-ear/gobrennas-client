import typedAction from "../util/typedAction";
import PropTypes from "prop-types";

const RecipeActions = {
  FETCH_RECIPES: 'FETCH_RECIPES',
  ADD_RECIPE: 'ADD_RECIPE',
  DELETE_RECIPE: 'DELETE_RECIPE',
    SELECT_RECIPE: 'SELECT_RECIPE',
    SEND_RAW_INGREDIENTS_TO_TASK_LIST: typedAction("recipe/send-raw-ingredients-to-task-list", {
        listId: PropTypes.number,
        recipeId: PropTypes.number,
    }),
};

export default RecipeActions;