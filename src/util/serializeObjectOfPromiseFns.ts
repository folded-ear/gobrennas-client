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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn<A extends unknown[] = any, R = any> = (...args: A) => Promise<R>;
const serializeObjectOfPromiseFns = <T extends Record<string, Fn>>(
    obj: T,
): T => {
    let queue: Promise<unknown> = Promise.resolve();
    const result = {} as Record<string, Fn>;
    const enqueue = <A extends unknown[], R>(
        fn: Fn<A, R>,
        ...args: A
    ): Promise<R> => {
        queue = queue
            .catch((error) =>
                // eslint-disable-next-line no-console
                console.error("Error in Promise", error),
            )
            .then(() => fn(...args));
        // This cast is safe, as queue currently matches, even though it won't
        // match in general.
        return queue as Promise<R>;
    };
    for (const k of Object.keys(obj)) {
        result[k] = (...args) => enqueue(obj[k], ...args);
    }
    // This cast is safe; I can't figure out how to trace the types of the
    // open-ended "methods" on the passed object, but the above loop will ensure
    // the same set of keys exist, and each has a value of the right type.
    return result as T;
};

export default serializeObjectOfPromiseFns;
