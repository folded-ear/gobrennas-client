export function addDistinct<T>(items: T[], newItem: T) {
    verifySingleType(items); // todo: remove
    if (items == null) return [newItem];
    if (items.indexOf(newItem) >= 0) return items;
    return items.concat(newItem);
}

export function removeAtIndex<T>(items: T[], idx: number): T[] {
    verifySingleType(items); // todo: remove
    if (items == null) return items;
    if (idx == null) return items;
    if (idx < 0) return items;
    if (idx === 0) return items.slice(1);
    items = items.slice();
    items.splice(idx, 1);
    return items;
}

export function removeDistinct<T>(items: T[] | undefined, oldItem: T) {
    verifySingleType(items, oldItem); // todo: remove
    if (items == null) return items;
    return removeAtIndex(items, items.indexOf(oldItem));
}

export function toggleDistinct<T>(items: T[] | undefined, theItem: T) {
    verifySingleType(items, theItem); // todo: remove
    if (items == null) return [theItem];
    const idx = items.indexOf(theItem);
    return idx >= 0 ? removeAtIndex(items, idx) : items.concat(theItem);
}

export function intersection<T>(left: T[] | undefined, right: T[] | undefined) {
    verifySingleType(left, right); // todo: remove
    const result: T[] = [];
    if (left == null || right == null) return result;
    if (left.length === 0 || right.length === 0) return result;
    const [outer, inner] =
        left.length < right.length ? [left, right] : [right, left];
    for (const it of outer) {
        if (inner.includes(it)) {
            result.push(it);
        }
    }
    return result;
}

function verifySingleType(...args) {
    const allTypes = new Set<string>();
    for (let a of args) {
        if (a == null) continue;
        if (typeof a === "string" || a[Symbol.iterator] == null) a = [a];
        for (const it of a) {
            if (it == null) continue;
            allTypes.add(typeof it);
        }
    }
    if (allTypes.size > 1)
        throw new TypeError("Found multiple types: " + [...allTypes]);
}
