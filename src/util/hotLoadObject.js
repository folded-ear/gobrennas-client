import invariant from "invariant";
import LoadObject from "./LoadObject";

/**
 * I am for use in a selector which returns a LoadObject that might need to have
 * loading of its value initiated by the request itself.
 *
 * @param getLO - a callback which will obtain the current load object from the
 *  store. It may also return `null`, implying LoadObject.empty().
 * @param doLoad - a callback to initiate loading a value, which must update the
 *  store such that the next invocation of getLO returns an already-loading LO.
 * @param shouldLoad - optional callback for whether the LO (returned by getLO)
 *  needs to load. This must yield `false` immediately after invoking doLoad. If
 *  not provided LoadObject.isEmpty is used.
 * @return {*|LoadObject<*>}
 */
const hotLoadObject = (
    getLO,
    doLoad,
    shouldLoad = lo => lo.isEmpty(),
) => {
    let lo = getLO() || LoadObject.empty();
    if (shouldLoad(lo)) {
        /*
         * This queuing will end up unwinding in a very graceless manner, so
         * don't make a bunch of new hot LOs in a single dispatch cycle. Each
         * one will be loaded as a separate dispatch, likely requeuing all the
         * subsequent items already in the queue. :) There is no "bulk queue",
         * which would address the problem. The second `shouldLoad` check inside
         * the thunk will make all subsequent thunks do nothing, but they are
         * still triggered.
         */
        setTimeout(() => {
            let nextLO = getLO();
            if (nextLO == null || shouldLoad(nextLO)) {
                doLoad();
                nextLO = getLO();
                invariant(nextLO != null, "doLoad must warm up getLO's cache");
                invariant(!shouldLoad(lo), "doLoad must create a pending LO");
            }
        });
        lo = lo.loading();
    }
    return lo;
};

export default hotLoadObject;
