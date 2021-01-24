
const findAncestorByName = (ancestorName, node) => {
    while (node && node.localName !== ancestorName) {
        node = node.parentNode;
    }
    return node;
};

export const findSvg = findAncestorByName.bind(undefined, "svg");

export default findAncestorByName;
