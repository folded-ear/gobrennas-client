export const addDistinct = (items, newItem) => {
    if (items == null) return [newItem];
    if (items.indexOf(newItem) >= 0) return items;
    return items.concat(newItem);
};

const removeAtIndex = (items, idx) => {
    if (idx < 0) return items;
    if (idx === 0) return items.slice(1);
    items = items.slice();
    items.splice(idx, 1);
    return items;
};

export const removeDistinct = (items, oldItem) => {
    if (items == null) return null;
    return removeAtIndex(items, items.indexOf(oldItem));
};

export const toggleDistinct = (items, theItem) => {
    if (items == null) return [theItem];
    const idx = items.indexOf(theItem);
    return idx >= 0
        ? removeAtIndex(items, idx)
        : items.concat(theItem);
};
