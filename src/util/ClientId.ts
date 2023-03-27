import PropTypes from "prop-types";
import buildSequence from "./buildSequence";
import {
    createChainableTypeChecker,
    PropTypeError,
} from "./typeHelpers";

const {
    PREFIX,
    next,
} = buildSequence();

const ClientId = {

    next,

    is(id) {
        return typeof id === "string"
            && id.length > 0
            && id.startsWith(PREFIX);
    },

    isNot(id) {
        return !ClientId.is(id);
    },

    propType: createChainableTypeChecker((props, propName) => {
        if (ClientId.is(props[propName])) {
            return;
        }
        return new PropTypeError(`'${propName}' isn't a valid ClientId`);
    }),

};

export const clientOrDatabaseIdType = PropTypes.oneOfType([
    PropTypes.number,
    ClientId.propType,
]);

export default ClientId;
