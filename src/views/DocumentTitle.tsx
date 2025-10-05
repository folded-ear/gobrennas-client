import { useEffect } from "react";

const ORIGINAL_TITLE = document.title;
const PREFIX =
    ORIGINAL_TITLE.indexOf("]") > 0
        ? ORIGINAL_TITLE.substring(0, ORIGINAL_TITLE.indexOf("]") + 1) + " "
        : "";
const SUFFIX = ORIGINAL_TITLE.substring(PREFIX.length).trim();

interface Props {
    children: string;
}

/**
 * I loosely emulate React 19's auto-handling of <title> elements.
 */
export default function DocumentTitle({ children }: Props) {
    useEffect(() => {
        document.title = PREFIX + children + " | " + SUFFIX;
        return () => {
            document.title = ORIGINAL_TITLE;
        };
    }, [children]);
    return null;
}
