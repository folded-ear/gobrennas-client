import * as React from "react";
import Markdown from "./Markdown";

interface Props {
    text?: string;
}

const RE_LIST = /(^|\n) *(1[.)]|[-*]) +\S.*\n/;

const RE_INLINE = /(\*|_|~~)(\w|[,.;:?!])(.*(\w|[,.;:?!]))?\1/;

function isMarkdown(text: string): boolean {
    return RE_LIST.test(text) || RE_INLINE.test(text);
}

const Directions = ({ text }: Props) => {
    if (text == null) return null;
    text = text.trim();
    if (text.length === 0) return null;
    // if there appears to be markdown, render it as such.
    if (isMarkdown(text)) {
        return <Markdown text={text} />;
    }
    // just split it up at line breaks and call it good.
    return (
        <>
            {text.split(/\n{2,}/).map((para, i) => (
                <p key={i}>
                    {para.split("\n").map((line, j) => (
                        <React.Fragment key={j}>
                            {j > 0 && <br />}
                            {line}
                        </React.Fragment>
                    ))}
                </p>
            ))}
        </>
    );
};

export default Directions;
