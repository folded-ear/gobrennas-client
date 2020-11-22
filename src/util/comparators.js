// this doesn't deal with non-latin alphabets, but good enough for now
const STRIP_NON_HUMAN_CHARS = /[^a-z0-9 ]/g;

/**
 * I am a string comparator that will use "human" rules instead of "computer"
 * rules for the comparison. Case and punctuation is ignored, which is close to
 * Unicode's collation rules (which use punctuation to break ties). I only
 * consider Latin alphabets. Nulls are collated with the empty string.
 */
export const humanStringComparator = (a, b) => {
    if (a == null) a = "";
    if (b == null) b = "";
    a = a.toLowerCase().replace(STRIP_NON_HUMAN_CHARS, "");
    b = b.toLowerCase().replace(STRIP_NON_HUMAN_CHARS, "");
    if (a < b) return -1;
    if (a > b) return +1;
    return 0;
};

/**
 * I am an object comparator based on the "name" key.
 */
export const byNameComparator = (a, b) =>
    humanStringComparator(a.name, b.name);

/**
 * I am an object comparator based on the "date" and "name" keys, used for
 * sorting plan buckets.
 */
export const bucketComparator = (a, b) => {
    let ad = a.date;
    let bd = b.date;
    if (ad != null || bd != null) {
        // one or both is non-null
        if (ad == null) return -1;
        if (bd == null) return +1;
        // both are non-null
        if (ad < bd) return -1;
        if (ad > bd) return +1;
    }
    return humanStringComparator(a.name, b.name);
};
