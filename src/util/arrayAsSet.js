export const addDistinct = (items, newItem) => {
    if (items == null) return [newItem];
    if (items.indexOf(newItem) >= 0) return items;
    return items.concat(newItem);
};

export const removeDistinct = (items, oldItem) => {
    if (items == null) return null;
    const idx = items.indexOf(oldItem);
    if (idx < 0) return items;
    if (idx === 0) items.slice(1);
    items = items.slice();
    items.splice(idx, 1);
    return items;
};