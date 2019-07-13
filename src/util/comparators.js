// this doesn't deal with non-latin alphabets, but good enough for now
const STRIP_NON_HUMAN_CHARS = /[^a-z0-9 ]/g

export const humanStringComparator = (a, b) => {
    let an = a.name
    let bn = b.name
    if (an == null) return bn == null ? 0 : -1
    if (bn == null) return 1
    an = an.toLowerCase().replace(STRIP_NON_HUMAN_CHARS, "")
    bn = bn.toLowerCase().replace(STRIP_NON_HUMAN_CHARS, "")
    if (an < bn) return -1
    if (an > bn) return +1
    return 0
}