/**
 * I partition the passed items into groups. The keyExtractor function is used
 * to find the group key for a given item. The returned Map will have a key
 * for every distinct value returned by the keyExtractor, each containing an
 * array of those items which yielded that key.
 *
 * The type signature is `List<E> -> (E -> K) -> Map<K, List<E>>`.
 *
 * @param items The items to group by key
 * @param keyExtractor Function to extract a key from a single item
 */
const groupBy = (items, keyExtractor) =>
    items.reduce((gs, it) => {
        const key = keyExtractor(it);
        if (gs.has(key)) {
            gs.get(key).push(it);
        } else {
            gs.set(key, [it]);
        }
        return gs;
    }, new Map());

export default groupBy;
