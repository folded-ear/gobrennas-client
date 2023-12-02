import groupBy from "./groupBy";

/**
 * I partition the passed items into two arrays, one with items that passed the
 * test and one with items that didn't. This is a specialized {@link groupBy}.
 *
 * @param items The items to group by their test result
 * @param test Predicate for testing the items.
 */
function partition<T>(
    items: T[],
    test: (t: T) => boolean | undefined,
): [T[], T[]] {
    const map = groupBy(items, test);
    return [map.get(true) || [], map.get(false) || []];
}

export default partition;
