import typedAction from "../util/typedAction";
import PropTypes from "prop-types";

const sendShape = {
    listId: PropTypes.number,
    recipeId: PropTypes.number,
};
const RecipeActions = {
    RECIPE_CREATED: 'recipe/recipe-created',
    RECIPE_DELETED: 'recipe/recipe-deleted',
    SEND_INGREDIENTS_TO_TASK_LIST: typedAction("recipe/send-raw-ingredients-to-task-list", sendShape),
    INGREDIENTS_SENT_TO_TASK_LIST: typedAction("recipe/raw-ingredients-sent-to-task-list", sendShape)
};

export default RecipeActions;