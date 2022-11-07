import PropTypes from "prop-types";
import typedAction from "util/typedAction";

const dissectionComponentType = PropTypes.shape({
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
});

const sendToPlanShape = {
    recipeId: PropTypes.number.isRequired,
    planId: PropTypes.number.isRequired,
};

const RecipeActions = {
    CREATE_RECIPE: "recipe/create-recipe",
    RECIPE_CREATED: "recipe/recipe-created",
    CANCEL_ADD: typedAction("recipe/cancel-add", {
        sourceId: PropTypes.number,
    }),
    UPDATE_RECIPE: "recipe/update-recipe",
    SET_RECIPE_PHOTO: "recipe/set-recipe-photo",
    RECIPE_UPDATED: "recipe/recipe-updated",
    CANCEL_EDIT: typedAction("recipe/cancel-edit", {
        id: PropTypes.number.isRequired,
    }),
    RECIPE_DELETED: "recipe/recipe-deleted",
    LOAD_EMPTY_RECIPE: "recipe/load-empty-recipe",
    LOAD_RECIPE_DRAFT: "recipe/load-recipe/draft",
    DRAFT_RECIPE_UPDATED: "recipe/draft-recipe-updated",
    NEW_DRAFT_LABEL: "recipe/new-draft-label",
    REMOVE_DRAFT_LABEL: "recipe/remove-draft-label",
    SAVE_DRAFT_RECIPE: "recipe/save-draft-recipe",
    RAW_INGREDIENT_DISSECTED: typedAction("recipe/raw-ingredient-dissected", {
        recipeId: PropTypes.number.isRequired,
        raw: PropTypes.string.isRequired,
        prep: PropTypes.string,
        quantity: dissectionComponentType,
        units: dissectionComponentType,
        name: dissectionComponentType.isRequired,
    }),
    NEW_DRAFT_INGREDIENT_YO: "recipe/new-draft-ingredient-yo",
    KILL_DRAFT_INGREDIENT_YO: "recipe/kill-draft-ingredient-yo",
    MULTI_LINE_DRAFT_INGREDIENT_PASTE_YO: "recipe/multi-line-draft-ingredient-paste-yo",

    LABEL_ADDED: typedAction("recipe/label-added", {
        id: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired,
    }),
    LABEL_REMOVED: typedAction("recipe/label-removed", {
        id: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired,
    }),
    SEND_TO_PLAN: typedAction("recipe/send-to-plan", sendToPlanShape),
    SENT_TO_PLAN: typedAction("recipe/sent-to-plan", sendToPlanShape),
    ERROR_SENDING_TO_PLAN: typedAction("recipe/error-sending-to-plan", sendToPlanShape),
};

export default RecipeActions;
