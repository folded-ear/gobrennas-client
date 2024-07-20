/**
 * I partition the passed items into groups. The keyExtractor function is used
 * to find the group key for a given item. The returned Map will have a key
 * for every distinct value returned by the keyExtractor, each containing an
 * array of those items which yielded that key.
 *
 * @param items The items to group by key
 * @param keyExtractor Function to extract a key from a single item
 */
function groupBy<K, T>(
    items: T[],
    keyExtractor: (t: T) => K | undefined,
): Map<K | undefined, T[]> {
    return items.reduce((gs, it) => {
        let key = keyExtractor(it);
        if (key === null) {
            key = undefined;
        }
        if (gs.has(key)) {
            gs.get(key).push(it);
        } else {
            gs.set(key, [it]);
        }
        return gs;
    }, new Map());
}

/**
 * I return a map of items, based on their extracted key. An error will be
 * raised if any extracted key is undefined (think NullPointerException), or if
 * two items extract the same key (think DuplicateKeyException).
 *
 * @param items THe items to map by key
 * @param keyExtractor Function to extract a key from a single item
 */
export function mapBy<K, T>(
    items: T[],
    keyExtractor: (t: T) => K | undefined,
): Map<K, T> {
    const result = new Map<K, T>();
    if (!items || items.length === 0) return result;
    for (const t of items) {
        const k = keyExtractor(t);
        if (k == null) throw new Error("Item returned undefined key");
        if (result.has(k))
            throw new Error(`Item returned duplicate key '${k}'`);
        result.set(k, t);
    }
    return result;
}

export default groupBy;
