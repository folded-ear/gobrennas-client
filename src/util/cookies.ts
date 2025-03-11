const readCookies = (): Record<string, string> =>
    document.cookie
        .split(";")
        .map((s) => s.trim().split("="))
        .filter((p) => p[0])
        .reduce(
            (m, p) => ({
                ...m,
                [p[0]]: p[1],
            }),
            {},
        );

/**
 * Get the cookie with the given name's value, or undefined if no cookie is set.
 *
 * @param name The name of the cookie to get.
 * @return The value of the cookie, or undefined if not set.
 */
export const getCookie = (name: string) => readCookies()[name];

/**
 * Set a cooke with the given name and value, optionally with additional cookie
 * attributes. All parts must already be properly encoded!
 *
 * @param name The name of the cookie to set.
 * @param value The value of the cookie.
 * @param attrs Any additional cookie attributes to set on the cookie.
 */
export const setCookie = (
    name: string,
    value: string,
    attrs?: Record<string, string>,
): void => {
    let cookie = name + "=" + value;
    for (const a in attrs) {
        cookie += "; " + a + "=" + attrs[a];
    }
    document.cookie = cookie;
};
