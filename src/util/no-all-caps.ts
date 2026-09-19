/**
 * I am the all-caps words kept exactly as written, wherever they appear.
 * Add abbreviations here that must stay upper case.
 */
const PRESERVED = new Set(["AP", "BBQ", "MSG", "XL"]);

/**
 * I map all-caps words to one fixed spelling, used wherever they appear
 * and never capitalized by position. Add units with a conventional
 * spelling here.
 */
const FIXED_SPELLINGS = new Map([
    ["TBSP", "Tbsp"],
    ["TSP", "tsp"],
]);

/**
 * I am the lower-case words a title leaves uncapitalized, unless they're
 * its first or last word.
 */
const SMALL_WORDS = new Set([
    "a",
    "an",
    "and",
    "at",
    "but",
    "by",
    "for",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
]);

/** I match a word: letters, with internal apostrophes. */
const RE_WORD = /\p{L}+(?:['’]\p{L}+)*/gu;

/** I match the end of a sentence, or a blank line. */
const RE_SENTENCE_BREAK = /[.!?]['"’”)\]]*\s|\n\s*\n/u;

/** I match a gap from the start of the text that is only indentation. */
const RE_TEXT_START = /^[^\S\n]*$/;

/** I match a gap ending in a line break and optional indentation. */
const RE_LINE_START = /\n[^\S\n]*$/;

/** I match the gap between two words of a label. */
const RE_RUN_GAP = /^[^\S\n]+$/;

/** I match a label's optional digits and the space after it. */
const RE_LABEL_GAP = /^(?:[^\S\n]*\d+)*[^\S\n]+$/;

/** I match the space at the end of a gap, within a line. */
const RE_TRAILING_SPACE = /[^\S\n]+$/;

/** I match a lower-case letter. */
const RE_LOWER = /\p{Ll}/u;

/** I match an upper-case letter. */
const RE_UPPER = /\p{Lu}/u;

/** I match a capitalized word: upper-case first, some lower. */
const RE_CAPITALIZED = /^\p{Lu}.*\p{Ll}/u;

const INDEFINITE_ARTICLE = "A";

interface Word {
    text: string;
    // the source text between the previous word (or start) and me
    before: string;
}

type Treatment = "keep" | "fixed" | "recase";

type Capitalize = (words: Word[], i: number) => boolean;

function isAllCaps(word: string): boolean {
    return RE_UPPER.test(word) && !RE_LOWER.test(word);
}

function isCapitalized(word: string): boolean {
    return RE_CAPITALIZED.test(word);
}

function capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function treatmentOf(words: Word[], i: number): Treatment {
    const word = words[i].text;
    if (!isAllCaps(word)) return "keep";
    if (word.length === 1) {
        const prev = words[i - 1]?.text;
        const byContext =
            word === INDEFINITE_ARTICLE &&
            prev != null &&
            (isAllCaps(prev) || isCapitalized(prev));
        return byContext ? "recase" : "keep";
    }
    if (PRESERVED.has(word)) return "keep";
    if (FIXED_SPELLINGS.has(word)) return "fixed";
    return "recase";
}

function startsLine(words: Word[], i: number): boolean {
    const before = words[i].before;
    return i === 0
        ? RE_TEXT_START.test(before) || RE_LINE_START.test(before)
        : RE_LINE_START.test(before);
}

/**
 * I return the indexes of words which follow a label, and so need a colon
 * before them.
 */
function findLabelEnds(words: Word[], treatments: Treatment[]): Set<number> {
    const ends = new Set<number>();
    words.forEach((_, i) => {
        if (treatments[i] !== "recase" || !startsLine(words, i)) return;
        let j = i + 1;
        while (
            j < words.length &&
            treatments[j] === "recase" &&
            RE_RUN_GAP.test(words[j].before)
        ) {
            j++;
        }
        if (
            j < words.length &&
            RE_LABEL_GAP.test(words[j].before) &&
            isCapitalized(words[j].text)
        ) {
            ends.add(j);
        }
    });
    return ends;
}

function rewrite(s: string, shouldCapitalize: Capitalize): string {
    const words: Word[] = [];
    let end = 0;
    for (const m of s.matchAll(RE_WORD)) {
        words.push({
            text: m[0],
            before: s.slice(end, m.index),
        });
        end = m.index + m[0].length;
    }
    const treatments = words.map((_, i) => treatmentOf(words, i));
    const labelEnds = findLabelEnds(words, treatments);
    const rewritten = words.map((w, i) => {
        const before = labelEnds.has(i)
            ? w.before.replace(RE_TRAILING_SPACE, ":$&")
            : w.before;
        switch (treatments[i]) {
            case "keep":
                return before + w.text;
            case "fixed":
                return before + FIXED_SPELLINGS.get(w.text);
            case "recase": {
                const lower = w.text.toLowerCase();
                return (
                    before +
                    (shouldCapitalize(words, i) ? capitalize(lower) : lower)
                );
            }
        }
    });
    return rewritten.join("") + s.slice(end);
}

/**
 * I rewrite all-caps words in lower case, without capitalizing anything.
 * I leave alone words with any lower-case letter, single letters (except
 * `A` after a capitalized or all-caps word), and the preserved and
 * fixed-spelling words. I add a colon after a label: a run of rewritten
 * words starting a line, then optional digits, followed on that line by a
 * capitalized word (`STEP 2 Dice` → `step 2: Dice`). I suit ingredient
 * lines.
 *
 * @example noAllCaps("2 TBSP AP FLOUR") // "2 Tbsp AP flour"
 */
export function noAllCaps(s: string): string {
    return rewrite(s, () => false);
}

/**
 * I rewrite all-caps words like {@link noAllCaps}, then capitalize every
 * rewritten word except small words (a, and, of, the, …) that are neither
 * first nor last.
 *
 * @example noAllCapsForTitle("RICE WITH A TWIST") // "Rice with a Twist"
 */
export function noAllCapsForTitle(s: string): string {
    return rewrite(
        s,
        (words, i) =>
            i === 0 ||
            i === words.length - 1 ||
            !SMALL_WORDS.has(words[i].text.toLowerCase()),
    );
}

/**
 * I rewrite all-caps words like {@link noAllCaps}, then capitalize a
 * rewritten word that starts a sentence: first in the text, or after
 * `.`, `!`, `?` or a blank line. A plain line break doesn't start a
 * sentence.
 *
 * @example noAllCapsForProse("STIR. ADD SALT.") // "Stir. Add salt."
 */
export function noAllCapsForProse(s: string): string {
    return rewrite(
        s,
        (words, i) => i === 0 || RE_SENTENCE_BREAK.test(words[i].before),
    );
}
