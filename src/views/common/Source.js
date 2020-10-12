import React from "react";
import PropTypes from "prop-types";

const Source = ({url}) => {
    try {
        const source = new URL(url);
        return (<p><a href={url} target="_blank" rel="noreferrer">{source.hostname}</a></p>);
    } catch (e) {
        return (<p>{url}</p>);
    }
};

Source.propTypes = {
    url: PropTypes.string
};

export default Source;
