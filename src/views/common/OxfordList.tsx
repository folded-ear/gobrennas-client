import * as React from "react";
import { ReactNode } from "react";

interface Props {
    prefix: ReactNode;
    suffix: ReactNode;
    children: ReactNode[];
}

const OxfordList: React.FC<Props> = ({ children: kids, prefix, suffix }) => {
    // zero is null
    if (kids.length === 0) return null;
    // one is self
    if (kids.length === 1) {
        return (
            <>
                {prefix}
                {kids[0]}
                {suffix}
            </>
        );
    }
    // two is and-separated
    if (kids.length === 2) {
        return (
            <>
                {prefix}
                {kids[0]}
                {" and "}
                {kids[1]}
                {suffix}
            </>
        );
    }
    // three or more is comma-separated w/ Oxford comma + and
    kids = kids.slice();
    const last = kids.pop();
    return (
        <>
            {prefix}
            {kids.flatMap((k) => [k, ", "])}
            {"and "}
            {last}
            {suffix}
        </>
    );
};

export default OxfordList;
