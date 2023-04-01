/**
 * I partition the passed items into groups. The keyExtractor function is used
 * to find the group key for a given item. The returned Map will have a key
 * for every distinct value returned by the keyExtractor, each containing an
 * array of those items which yielded that key.
 *
 * @param items The items to group by key
 * @param keyExtractor Function to extract a key from a single item
 */
function groupBy<K, T>(items: T[], keyExtractor: (t: T) => K | undefined): Map<K | undefined, T[]> {
    return items.reduce((gs, it) => {
        let key = keyExtractor(it);
        if (key === null) {
            key = undefined;
        }
        if (gs.has(key)) {
            gs.get(key).push(it);
        } else {
            gs.set(key, [ it ]);
        }
        return gs;
    }, new Map());
}

export default groupBy;
