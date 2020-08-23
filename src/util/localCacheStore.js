const localCacheStore = (storeKey, store) => {
    const key = `foodinger:LCS:${storeKey}`;
    const ls = window.localStorage;
    const cache = ls.getItem(key);
    if (cache != null) {
        try {
            // super icky "private" member direct access!
            store._state = JSON.parse(cache);
        } catch (e) {
            console.warn(`Failed to reload '${storeKey}'s state`, e);
        }
    }
    const oldReduce = store.reduce;
    store.reduce = (state, action) => {
        const newState = oldReduce.call(store, state, action);
        if (state !== newState) {
            ls.setItem(key, JSON.stringify(newState));
        }
        return newState;
    };
    return store;
};

export default localCacheStore;