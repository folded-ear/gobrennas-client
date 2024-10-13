const readCookies = () =>
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

export const getCookie = (name) => readCookies()[name];
