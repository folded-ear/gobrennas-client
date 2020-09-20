import PropTypes from "prop-types";
import { clientOrDatabaseIdType } from "../../util/ClientId";

export const tuplePropTypes = {
    active: PropTypes.bool,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const baseItemPropTypes = {
    id: clientOrDatabaseIdType.isRequired, // either the ingredient or the single backing task
    name: PropTypes.string.isRequired,
};

export const itemPropTypes = {
    ...baseItemPropTypes,
    pending: PropTypes.bool.isRequired,
    deleting: PropTypes.bool.isRequired,
    completing: PropTypes.bool.isRequired,
    acquiring: PropTypes.bool.isRequired,
};
