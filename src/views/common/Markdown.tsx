import PropTypes from "prop-types";
import React from "react";
import MarkdownView from "react-showdown";

const Markdown = ({
                      text,
                  }) => {
    if (!text) {
        return null;
    }
    return <div className="markdown">
        <MarkdownView
            markdown={text}
            options={{
                strikethrough: true,
                simpleLineBreaks: true,
            }}
        />
    </div>;
};

Markdown.propTypes = {
    text: PropTypes.string.isRequired,
};

export default Markdown;
