export const getJsonItem = (
    key,
    storage = localStorage,
) => {
    const value = storage.getItem(key)
    if (value == null) return null
    try {
        return JSON.parse(value)
    } catch (e) {
        console.warn(`Error deserializing '${key}' storage value`, e, value)
        return null
    }
}

export const setJsonItem = (
    key,
    value,
    storage = localStorage,
    replacer = null,
) =>
    storage.setItem(key, JSON.stringify(value, replacer))