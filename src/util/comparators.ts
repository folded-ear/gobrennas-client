const collator = new Intl.Collator(undefined, {
    sensitivity: "base",
    ignorePunctuation: true,
    numeric: true,
});

/**
 * I am a string comparator that will use "human" rules instead of "computer"
 * rules for the comparison. Case and punctuation is ignored, which is close to
 * Unicode's collation rules (which use punctuation to break ties). Numeric
 * strings will be treated as numbers ("2" < "10").
 */
export const humanStringComparator = collator.compare;

interface Named {
    name: string
}

/**
 * I am an object comparator based on the "name" key.
 */
export const byNameComparator = (a: Named, b: Named) =>
    humanStringComparator(a.name, b.name);

interface Dated {
    date?: Date
}

type Bucket = Named & Dated;

/**
 * I am an object comparator based on the "date" and "name" keys, used for
 * sorting plan buckets.
 */
export const bucketComparator = (a: Bucket, b: Bucket) => {
    const ad = a.date;
    const bd = b.date;
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

/**
 * I compare two arrays, element by element, until there is a difference, or one
 * runs out of elements. The first pair-wise comparison that differs is the
 * result, otherwise the one that ran out of elements first, otherwise they are
 * considered equal.
 */
export const zippedComparator = (a: Array<string>, b: Array<string>): number => {
    for (let i = 0, l = Math.min(a.length, b.length); i < l; i++) {
        const c = humanStringComparator(a[i], b[i]);
        if (c !== 0) return c;
    }
    return a.length - b.length;
};
