import React from "react";
import MarkdownView from "react-showdown";

interface Props {
    text: string;
}

const Markdown: React.FC<Props> = ({ text }) => {
    if (!text) {
        return null;
    }
    return (
        <div className="markdown">
            <MarkdownView
                markdown={text}
                options={{
                    strikethrough: true,
                    simpleLineBreaks: true,
                }}
            />
        </div>
    );
};

export default Markdown;
