/* eslint-disable */
// noinspection JSUnusedGlobalSymbols

import Immutable from "immutable";
import LoadObject from "./LoadObject";

/**
 * LoadObjectMap is a structure that mimics Immutable.Map where the values are
 * LoadObjects. It has a few features that make working with LoadObjects easier.
 *
 *   - `get()` always returns a value, if the value is not found in the
 *     underlying map an empty load object is returned, and...
 *   - all keys that are requested in the same frame that do not exist in the
 *     underlying map will be passed to the `loadAll()` function given to the
 *     constructor of the map. This allows them to then be "loaded".
 *
 * There is some important timing issues to be aware of regarding `loadAll()`.
 *
 *   - `loadAll()` is called in the frame AFTER calls to `get()` that has a
 *     cache miss.
 *   - `loadAll()` must SYNCHRONOUSLY change all of the given keys to a state
 *     in the cache such that they will no longer be considered a cache miss.
 *     Generally this means setting them to loading. Dispatching an action is
 *     synchronous and generally what should be done in `loadAll()`.
 */

class LoadObjectMap<K, V> {
    _data: Immutable.Map<K, LoadObject<V>>;
    _loadAll: (key: Set<K>) => void;
    _shouldLoad: (lo: LoadObject<V>) => boolean;
    // Mutable state on this map so we don't accidently load something many times.
    _preventLoadsForThisFrame: Set<K>;
    _clearPreventLoadsForThisFrame: unknown;

    constructor(
        loadAll: (keys: Set<K>) => void,
        shouldLoad?: (lo: LoadObject<V>) => boolean,
    ) {
        this._data = Immutable.Map();
        this._loadAll = loadAll;

        this._shouldLoad = shouldLoad || ((lo) => lo.isEmpty());

        this._preventLoadsForThisFrame = new Set();
        this._clearPreventLoadsForThisFrame = null;
    }

    // Some trickery so that we always return a load object, and call the provided
    // load function when appropriate.
    get(key: K): LoadObject<V> {
        const lo: LoadObject<V> | undefined = this._data.has(key)
            ? this._data.get(key)
            : LoadObject.empty();

        if (!this._preventLoadsForThisFrame.has(key) && this._shouldLoad(lo!)) {
            // This must be done asynchronously to avoid nested dispatches.
            this._preventLoadsForThisFrame.add(key);

            if (!this._clearPreventLoadsForThisFrame) {
                this._clearPreventLoadsForThisFrame = setTimeout(() => {
                    this._loadAll(this._preventLoadsForThisFrame);

                    this._preventLoadsForThisFrame = new Set();
                    this._clearPreventLoadsForThisFrame = null;
                }, 0);
            }
        }

        return lo as LoadObject<V>;
    }

    getKeys(): Array<K> {
        return Array.from(this._data.keys());
    }

    getValues(): Array<LoadObject<V>> {
        return Array.from(this._data.values());
    }

    /**
     * I indicate if this map _already has_ this key. You probably don't want
     * this method, as the whole point of LoadObjectMap is to transparently
     * load values for keys. In particular, invoking this method will provide no
     * information about what `get` may return now or in the future.
     * @param key The key to check the presence of.
     * @returns {boolean} Whether the key already exists in the map.
     */
    has(key: K): boolean {
        return this._data.has(key);
    }

    every(fn: (lo: LoadObject<V>, key: K) => boolean): boolean {
        return this._data.every(fn);
    }

    some(fn: (lo: LoadObject<V>, key: K) => boolean): boolean {
        return this._data.some(fn);
    }

    forEach(fn: (lo: LoadObject<V>, key: K) => any): void {
        this._data.forEach(fn);
    }

    get size(): number {
        return this._data.size;
    }

    ////////// A selection of mutation functions found on Immutable.Map //////////
    delete(key: K): LoadObjectMap<K, V> {
        return this._mutate(() => this._data.delete(key));
    }

    set(key: K, lo: LoadObject<V>): LoadObjectMap<K, V> {
        return this._mutate(() => this._data.set(key, lo));
    }

    merge(map: Iterable<[K, LoadObject<V>]>): LoadObjectMap<K, V> {
        return this._mutate(() => this._data.merge(map));
    }

    filter(fn: (lo: LoadObject<V>, key: K) => boolean): LoadObjectMap<K, V> {
        return this._mutate(() => this._data.filter(fn));
    }

    update(
        key: K,
        fn: (lo: LoadObject<V>) => LoadObject<V>,
    ): LoadObjectMap<K, V> {
        // @ts-ignore - this one looks to be a Flow/Typescript wonky?
        return this._mutate(() => this._data.update(key, fn));
    }

    _mutate(fn: () => Immutable.Map<K, LoadObject<V>>): LoadObjectMap<K, V> {
        const nextData = fn();

        if (nextData === this._data) {
            return this;
        }

        const nextThis = new LoadObjectMap(this._loadAll, this._shouldLoad);
        nextThis._data = nextData;
        return nextThis;
    }
}

export default LoadObjectMap;
