import dispatcher, { FluxAction } from "@/data/dispatcher";

type TimeoutId = number;
const timeoutRegistry = new Map<FluxAction["type"], TimeoutId>();

const flushPending = () => {
    // to avoid jacking your data on hot reload, disable the unload flush in dev
    if (import.meta.env.PROD) {
        for (const k of timeoutRegistry.keys()) {
            doFutureWork(k);
        }
    }
};

const doFutureWork = (type: FluxAction["type"]) => {
    // Future work is a sufficiently advanced use case that trusting the
    // caller to have read the docs, and only specify a type with a bare
    // action is enough to justify this cast. Hopefully. 🤞
    dispatcher.dispatch({ type } as FluxAction);
    timeoutRegistry.delete(type);
    if (timeoutRegistry.size === 0) {
        window.removeEventListener("beforeunload", flushPending);
    }
};

/**
 * I will queue up an action type for the future dispatch, always pushing at
 * least 'delay' seconds forward from the last request for the given action
 * type. Only the type may be provided; no additional payload attributes are
 * available. "The Future" will arrive immediately on unload, even if the
 * specified delay hasn't elapsed.
 *
 * @param type The action type to queue up for future dispatch.
 * @param delay The number of seconds to wait before dispatching.
 */
const inTheFuture = (type: FluxAction["type"], delay: number = 2) => {
    if (timeoutRegistry.size === 0) {
        window.addEventListener("beforeunload", flushPending);
    }
    if (timeoutRegistry.has(type)) {
        clearTimeout(timeoutRegistry.get(type));
    }
    timeoutRegistry.set(
        type,
        window.setTimeout(doFutureWork.bind(null, type), delay * 1000),
    );
};

export default inTheFuture;
