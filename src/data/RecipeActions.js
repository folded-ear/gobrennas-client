import typedAction from "../util/typedAction"
import PropTypes from "prop-types"

const sendShape = {
    listId: PropTypes.number,
    recipeId: PropTypes.number,
}

const dissectionComponentType = PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
})

const RecipeActions = {
    RECIPE_CREATED: 'recipe/recipe-created',
    RECIPE_UPDATED: 'recipe/recipe-updated',
    RECIPE_DELETED: 'recipe/recipe-deleted',
    LOAD_EMPTY_RECIPE: 'recipe/load-empty-recipe',
    LOAD_RECIPE_DRAFT: 'recipe/load-recipe/draft',
    DRAFT_RECIPE_UPDATED: 'recipe/draft-recipe-updated',
    SAVE_DRAFT_RECIPE: 'recipe/save-draft-recipe',
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
    DISSECTION_RECORDED: typedAction("recipe/dissection-recorded", {
        recipeId: PropTypes.number.isRequired,
        raw: PropTypes.string.isRequired,
    }),
}

export default RecipeActions