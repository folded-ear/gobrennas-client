import Markdown from "./Markdown";

interface Props {
    text?: string;
}

const RE_LIST = /(^|\n) *(1[.)]|[-*]) +\S.*\n/;

function isMarkdown(text: string): boolean {
    return RE_LIST.test(text);
}

const Directions = ({ text }: Props) => {
    if (text == null) return null;
    text = text.trim();
    if (text.length === 0) return null;
    // if there appears to be a markdown list, assume it's markdown
    if (isMarkdown(text)) {
        return <Markdown text={text} />;
    }
    // ok, just split paragraphs at line breaks and call it good.
    return (
        <>
            {text.split("\n").map((line, i) => (
                <p key={i}>{line}</p>
            ))}
        </>
    );
};

export default Directions;
