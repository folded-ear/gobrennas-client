import PropTypes from "prop-types";
import typedAction from "@/util/typedAction";
import { bfsIdType } from "@/global/types/identity";

const sendToPlanShape = {
    recipeId: bfsIdType.isRequired,
    planId: bfsIdType.isRequired,
    scale: PropTypes.number,
};

const RecipeActions = {
    SEND_TO_PLAN: typedAction("recipe/send-to-plan", {
        ...sendToPlanShape,
        recipeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
            .isRequired,
    }),
    SENT_TO_PLAN: typedAction("recipe/sent-to-plan", sendToPlanShape),
    ERROR_SENDING_TO_PLAN: typedAction(
        "recipe/error-sending-to-plan",
        sendToPlanShape,
    ),
};

export default RecipeActions;
