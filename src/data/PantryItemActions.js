import PropTypes from "prop-types";
import typedAction from "util/typedAction";

const PantryItemActions = {
    LOAD_PANTRYITEMS: "LOAD_PANTRYITEMS",
    PANTRYITEMS_LOADED: "PANTRYITEMS_LOADED",
    ADD_PANTRYITEM: "ADD_PANTRYITEM",
    PANTRYITEMS_ADDED: "PANTRYITEMS_ADDED",
    ORDER_FOR_STORE: "pantry-item/order-for-store",
    SEND_TO_PLAN: typedAction("pantry-item/send-to-plan", {
        planId: PropTypes.number.isRequired,
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
    }),
};

export default PantryItemActions;