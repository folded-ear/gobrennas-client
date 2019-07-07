import PropTypes from "prop-types";
import React from "react";
import { Converter } from "react-showdown";

const converter = new Converter({
    strikethrough: true,
    simpleLineBreaks: true,
});

const Markdown = ({
                      text,
                  }) => {
    if (!text) {
        return null;
    }
    return <div className="markdown">
        {converter.convert(text)}
    </div>;
};

Markdown.propTypes = {
    text: PropTypes.string.isRequired,
};

export default Markdown;
