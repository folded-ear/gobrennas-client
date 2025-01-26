/**
 * I wrap an object where every property is a Promise-returning function with a
 * single queue so that at most one unsettled Promise exists at a time,
 * regardless of how many times or how quickly the functions on the object are
 * invoked. Invocations will be played in FIFO order, synchronously if no prior
 * invocation is in flight, asynchronously if there is.
 *
 * Note that a single queue is used for all functions, not per-function queues.
 *
 * @param obj An object whose own properties are all Promise-returning functions
 * @returns a new object, with the same property keys, each of which is a new
 *  function accepting the same arguments as the corresponding function in the
 *  passed object, which will queue up invocations to the wrapped object's
 *  functions.
 */
const serializeObjectOfPromiseFns = <T extends object>(obj: T): T => {
    let queue = Promise.resolve();
    const result = {} as T;
    const enqueue = (fn, args) => {
        queue = queue
            .catch((error) =>
                // eslint-disable-next-line no-console
                console.error("Error in Promise", error),
            )
            .then(() => fn(...args));
        return queue;
    };
    for (const k of Object.keys(obj)) {
        result[k] = (...args) => enqueue(obj[k], args);
    }
    return result;
};

export default serializeObjectOfPromiseFns;
