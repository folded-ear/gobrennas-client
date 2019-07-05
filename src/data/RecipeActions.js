import typedAction from "../util/typedAction";
import PropTypes from "prop-types";

const sendShape = {
    listId: PropTypes.number,
    recipeId: PropTypes.number,
};
const RecipeActions = {
    RECIPE_CREATED: 'recipe/recipe-created',
    RECIPE_DELETED: 'recipe/recipe-deleted',
    SELECT_RECIPE: 'recipe/select-recipe',
    SEND_RAW_INGREDIENTS_TO_TASK_LIST: typedAction("recipe/send-raw-ingredients-to-task-list", sendShape),
    RAW_INGREDIENTS_SENT_TO_TASK_LIST: typedAction("recipe/raw-ingredients-sent-to-task-list", sendShape)
};

export default RecipeActions;