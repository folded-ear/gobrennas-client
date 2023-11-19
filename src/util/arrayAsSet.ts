export function addDistinct<T>(items: T[], newItem: T) {
    if (items == null) return [ newItem ];
    if (items.indexOf(newItem) >= 0) return items;
    return items.concat(newItem);
}

export function removeAtIndex(items: any[], idx) {
    if (idx < 0) return items;
    if (idx === 0) return items.slice(1);
    items = items.slice();
    items.splice(idx, 1);
    return items;
}

export function removeDistinct<T>(items: T[] | undefined, oldItem: T) {
    if (items == null) return items;
    return removeAtIndex(items, items.indexOf(oldItem));
}

export function toggleDistinct<T>(items: T[] | undefined, theItem: T) {
    if (items == null) return [ theItem ];
    const idx = items.indexOf(theItem);
    return idx >= 0
        ? removeAtIndex(items, idx)
        : items.concat(theItem);
}
