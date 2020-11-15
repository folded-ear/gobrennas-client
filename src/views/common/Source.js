import React from "react";
import PropTypes from "prop-types";

const Source = ({url}) => {
    try {
        const source = new URL(url);
        return (<a href={url} target="_blank" rel="noreferrer">{source.hostname}</a>);
    } catch (e) {
        return url;
    }
};

Source.propTypes = {
    url: PropTypes.string
};

export default Source;
