import { Maybe } from "graphql/jsutils/Maybe";

function findAncestorByName(
    ancestorName: string,
    node: Element,
): Maybe<Element> {
    while (node && node.localName !== ancestorName) {
        node = node.parentNode as Element; // tee-hee
    }
    return node;
}

export const findSvg = findAncestorByName.bind(undefined, "svg");

export default findAncestorByName;
