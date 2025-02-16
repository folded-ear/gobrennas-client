export const getJsonItem = (key: string, storage = localStorage) => {
    const value = storage.getItem(key);
    if (value == null) return null;
    try {
        return JSON.parse(value);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Error deserializing '${key}' storage value`, e, value);
        return null;
    }
};

type Replacer = (this: unknown, key: string, value: unknown) => unknown;

export const setJsonItem = (
    key: string,
    value: unknown,
    storage = localStorage,
    replacer?: Replacer,
) => storage.setItem(key, JSON.stringify(value, replacer));
