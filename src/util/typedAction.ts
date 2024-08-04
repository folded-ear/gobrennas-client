import PropTypes from "prop-types";

export const CONTAINER_KEY = "payload";

// eslint-disable-next-line @typescript-eslint/ban-types
export type CheckableActionType = string | (String & { actionTypes?: object });

/*
 * This function uses a bit of JS trickery in order to "hide" a proptypes def
 * on a string, which will then be used by ValidatingDispatcher to validate that
 * actions of this type are dispatched with the correct shape.
 *
 * NB: the 'type' key is implicitly allowed for any action.
 *
 * NB: the `exact` PropTypes checker is used, so extra keys will also surface
 * complaints (you can't sometimes hide extra stuff in an action).
 */
const typedAction = (type: string, shape: object): CheckableActionType => {
    if (import.meta.env.NODE_ENV !== "production" && shape != null) {
        // noinspection JSPrimitiveTypeWrapperUsage
        const checkable: CheckableActionType = new String(type); // eslint-disable-line no-new-wrappers
        // noinspection JSPrimitiveTypeWrapperUsage
        checkable.actionTypes = {
            [CONTAINER_KEY]: PropTypes.exact({
                ...shape,
                // PropTypes.string does primitives
                type: PropTypes.instanceOf(String).isRequired,
            }).isRequired,
        };
        return checkable;
    }
    return type;
};

export default typedAction;
