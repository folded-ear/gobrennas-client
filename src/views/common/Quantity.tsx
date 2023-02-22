import PropTypes from "prop-types";
import React from "react";

function format(quantity) {
    if (quantity === 0.25) return "1/4";
    else if (quantity > 0.33 && quantity < 0.34) return "1/3";
    else if (quantity === 0.5) return "1/2";
    else if (quantity > 0.66 && quantity < 0.67) return "2/3";
    else if (quantity === 0.75) return "3/4";
    return quantity;
}

const Quantity = ({quantity, units, addSpace}) => {
    if (quantity == null) return null;
    return units == null
        ? <React.Fragment>
            {format(quantity)}
            {addSpace && " "}
        </React.Fragment>
        : <React.Fragment>
            {format(quantity)}
            {" "}
            {units}
            {addSpace && " "}
        </React.Fragment>;
};

Quantity.propTypes = {
    quantity: PropTypes.number,
    units: PropTypes.string, // for the moment, at least
    addSpace: PropTypes.bool,
};

export default Quantity;