/**
 * I return a stateful predicate which will only accept distinct keys, as
 * defined by `keyExtractor`.
 *
 * @param keyExtractor Extract the key from a value, to test if distinct.
 */
export default function distinctByKey<T, K>(keyExtractor: (it: T) => K) {
    const uniquer = new Set<K>();
    return (it: T) => {
        const key: K = keyExtractor(it);
        if (uniquer.has(key)) return false;
        uniquer.add(key);
        return true;
    };
}
