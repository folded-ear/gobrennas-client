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
        <MarkdownView
            markdown={text}
            options={{
                strikethrough: true,
                simpleLineBreaks: true,
            }}
            extensions={[
                {
                    type: "lang",
                    filter: (text: string) => {
                        const lines = text.split("\n");
                        let prev = 0;
                        let start: number;
                        while ((start = lines.indexOf("```diff", prev)) >= 0) {
                            const end = lines.indexOf("```", start + 1);
                            if (end < 0) break;
                            lines[start] = `<pre class="diff language-diff">`;
                            lines[end] = `</pre>`;
                            for (let i = start + 1; i < end; i++) {
                                const l = lines[i];
                                if (l.startsWith("@@")) {
                                    lines[
                                        i
                                    ] = `<code class="range">${l}</code>`;
                                } else if (l.startsWith("+")) {
                                    lines[
                                        i
                                    ] = `<code class="inserted">${l}</code>`;
                                } else if (l.startsWith("-")) {
                                    lines[
                                        i
                                    ] = `<code class="deleted">${l}</code>`;
                                }
                            }
                            // Combine the start and first line, to avoid the
                            // extra line break from the nested <code> tag.
                            lines[start] += lines[start + 1];
                            lines.splice(start + 1, 1);
                            prev = end;
                        }
                        return lines.join("\n");
                    },
                },
            ]}
            className="markdown"
        />
    );
};

export default Markdown;
