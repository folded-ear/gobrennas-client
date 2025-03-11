const ALPHABET =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";

export function rand_chars(n: number): string;
export function rand_chars(n: number, radix: number): string;
export function rand_chars(n: number, alphabet: string): string;
export function rand_chars(n: number, rOrA?: unknown): string {
    if (!n || n < 0) return "";
    let alphabet: string;
    let radix: number;
    if (typeof rOrA === "number") {
        if (rOrA > ALPHABET.length)
            throw new TypeError("Max supported radix is " + ALPHABET.length);
        alphabet = ALPHABET;
        radix = rOrA;
    } else {
        if (typeof rOrA === "string") {
            if (rOrA.length > 256)
                throw new TypeError("Max supported alphabet size is 256");
            alphabet = rOrA;
        } else {
            alphabet = ALPHABET;
        }
        radix = alphabet.length;
    }
    const entropy = crypto.getRandomValues(new Uint8Array(n));
    let s = "";
    for (const idx of entropy) {
        s += alphabet[idx % radix];
    }
    return s;
}
