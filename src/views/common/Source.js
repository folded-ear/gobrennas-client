import PropTypes from "prop-types";
import React from "react";

const Source = ({url}) => {
    try {
        const source = new URL(url);
        return (<a href={url} target="_blank" rel="noreferrer noopener">{source.hostname}</a>);
    } catch (e) {
        return url;
    }
};

Source.propTypes = {
    url: PropTypes.string
};

export default Source;
