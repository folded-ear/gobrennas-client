import typedAction from "../util/typedAction";
import PropTypes from "prop-types";

const sendShape = {
    listId: PropTypes.number,
    recipeId: PropTypes.number,
};

const dissectionComponentType = PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
});

const RecipeActions = {
    RECIPE_CREATED: 'recipe/recipe-created',
    RECIPE_DELETED: 'recipe/recipe-deleted',
    ASSEMBLE_SHOPPING_LIST: typedAction("recipe/assemble-shopping-list", sendShape),
    SHOPPING_LIST_ASSEMBLED: typedAction("recipe/shopping-list-assembled", sendShape),
    RAW_INGREDIENT_DISSECTED: typedAction("recipe/raw-ingredient-dissected", {
        recipeId: PropTypes.number.isRequired,
        raw: PropTypes.string.isRequired,
        prep: PropTypes.string,
        quantity: dissectionComponentType,
        units: dissectionComponentType,
        name: dissectionComponentType.isRequired,
    }),
};

export default RecipeActions;