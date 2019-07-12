import typedAction from "../util/typedAction";
import PropTypes from "prop-types";

const sendShape = {
    listId: PropTypes.number,
    recipeId: PropTypes.number,
};
const RecipeActions = {
    RECIPE_CREATED: 'recipe/recipe-created',
    RECIPE_DELETED: 'recipe/recipe-deleted',
    ASSEMBLE_SHOPPING_LIST: typedAction("recipe/assemble-shopping-list", sendShape),
    SHOPPING_LIST_ASSEMBLED: typedAction("recipe/shopping-list-assembled", sendShape),
};

export default RecipeActions;