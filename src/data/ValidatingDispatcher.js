import { Dispatcher } from "flux";
import PropTypes from "prop-types";
import { CONTAINER_KEY } from "../util/typedAction";

const checkPayload = payload => {
    if (payload.type == null) {
        throw new Error("Actions must have a 'type' key");
    }
    if (payload.type.actionTypes != null) {
        PropTypes.checkPropTypes(payload.type.actionTypes, {[CONTAINER_KEY]: payload}, "actionTypes", payload.type);
    }
};

class ValidatingDispatcher extends Dispatcher {

    dispatch(payload) {
        checkPayload(payload);
        super.dispatch(payload);
    }

}

export default ValidatingDispatcher;
