import PropTypes from "prop-types";

const NOISE = Math.floor(Math.random() * 100000); // ~5 random digits
const PREFIX = "c_" + NOISE + "_";
let counter = 0;

const ClientId = {

    next() {
        return PREFIX + (++counter);
    },

    is(id) {
        return typeof id === "string"
            && id.length > 0
            && id.startsWith(PREFIX);
    },

    isNot(id) {
        return !ClientId.is(id);
    },

    propType(props, propName) {
        if (ClientId.is(props[propName])) {
            return;
        }
        return new Error(`'${propName}' isn't a valid ClientId`);
    },

};

export const clientOrDatabaseIdType = PropTypes.oneOfType([
    PropTypes.number,
    ClientId.propType,
]);

export default ClientId;