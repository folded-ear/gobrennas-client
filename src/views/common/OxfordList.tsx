import PropTypes from "prop-types";
import React from "react";

const OxfordList = ({
    children: kids,
    prefix,
    suffix,
}) => {
    // zero is null
    if (kids.length === 0) return null;
    // one is self
    if (kids.length === 1) {
        return <>
            {prefix}
            {kids[0]}
            {suffix}
        </>;
    }
    // two is and-separated
    if (kids.length === 2) {
        return <>
            {prefix}
            {kids[0]}
            {" and "}
            {kids[1]}
            {suffix}
        </>;
    }
    // three or more is comma-separated w/ Oxford comma + and
    kids = kids.slice();
    const last = kids.pop();
    return <>
        {prefix}
        {kids.flatMap(k => [k, ", "])}
        {"and "}
        {last}
        {suffix}
    </>;
};

OxfordList.propTypes = {
    prefix: PropTypes.node,
    children: PropTypes.arrayOf(PropTypes.node),
    suffix: PropTypes.node,
};

export default OxfordList;
