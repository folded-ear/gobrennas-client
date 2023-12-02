import { Dispatcher } from "flux";
import invariant from "invariant";
import PropTypes from "prop-types";
import { CONTAINER_KEY } from "util/typedAction";
import { FluxAction } from "global/types/types";

const checkPayload = (payload: FluxAction) => {
    invariant(payload.type != null, "Actions must have a 'type' key");
    // noinspection SuspiciousTypeOfGuard
    if (payload.type instanceof String && payload.type.actionTypes) {
        PropTypes.checkPropTypes(
            payload.type.actionTypes,
            { [CONTAINER_KEY]: payload },
            "actionTypes",
            payload.type.toString(),
        );
    }
};

class ValidatingDispatcher extends Dispatcher<FluxAction> {
    dispatch(payload: FluxAction) {
        checkPayload(payload);
        super.dispatch(payload);
    }
}

export default ValidatingDispatcher;
