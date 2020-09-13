import Dispatcher from "../data/dispatcher";

const timeoutRegistry = new Map();

/**
 * I will queue up an action type for the future dispatch, always pushing at
 * least 'delay' seconds forward from the last request for the given action
 * type. Only the type may be provided; no additional payload attributes are
 * available.
 *
 * @param type The action type to queue up for future dispatch.
 * @param delay The number of seconds to wait before dispatching.
 */
const inTheFuture = (type, delay = 2) => {
    if (timeoutRegistry.has(type)) {
        clearTimeout(timeoutRegistry.get(type));
    }
    timeoutRegistry.set(type, setTimeout(() => {
        Dispatcher.dispatch({
            type: type,
        });
    }, delay * 1000));
};

export default inTheFuture;