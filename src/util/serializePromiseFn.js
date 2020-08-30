/**
 * I wrap a Promise-returning function with a queue so that at most one
 * unsettled Promise exists at a time, regardless of how many time and how
 * quickly the function is invoked. Invocations will be played in FIFO order,
 * synchronously if no prior invocation is in flight, asynchronously if there
 * is.
 *
 * Note that a separate queue is used for each function. If you want to
 * serialize a collection of functions with a single queue, check out
 * `serializeObjectOfPromiseFns`.
 *
 * @param promiseFn The Promise-returning function to wrap.
 * @returns a new function, which does NOT return a Promise, but accepts the
 *  same arguments as the passed function, and will queue up invocations to the
 *  wrapped function.
 */
const serializePromiseFn = promiseFn => {
    const queue = [];
    let pending = false;
    const flush = () => {
        if (pending) return;
        if (queue.length === 0) return;
        pending = true;
        promiseFn(...queue.shift())
            .finally(() => {
                pending = false;
                flush();
            });
    };
    return (...args) => {
        queue.push(args);
        flush();
    };
};

export default serializePromiseFn;