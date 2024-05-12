import PropTypes from "prop-types";
import typedAction from "util/typedAction";

const sendToPlanShape = {
    recipeId: PropTypes.number.isRequired,
    planId: PropTypes.number.isRequired,
    scale: PropTypes.number,
};

const RecipeActions = {
    RECIPE_DELETED: "recipe/recipe-deleted",
    SEND_TO_PLAN: typedAction("recipe/send-to-plan", sendToPlanShape),
    SENT_TO_PLAN: typedAction("recipe/sent-to-plan", sendToPlanShape),
    ERROR_SENDING_TO_PLAN: typedAction(
        "recipe/error-sending-to-plan",
        sendToPlanShape,
    ),
};

export default RecipeActions;
