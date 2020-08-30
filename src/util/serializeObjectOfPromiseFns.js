/**
 * I wrap an object where every property is a Promise-returning function with a
 * single queue so that at most one unsettled Promise exists at a time,
 * regardless of how many time and how quickly the functions on the object are
 * invoked. Invocations will be played in FIFO order, synchronously if no prior
 * invocation is in flight, asynchronously if there is.
 *
 * Note that a single queue is used for all functions. If you want per-function
 * queues, check out `serializePromiseFn`.
 *
 * @param obj An object whose own properties are all Promise-returning functions
 * @returns a new object, with the same property keys, each of which is a new
 *  function. These functions do NOT return a Promise, but accept the same
 *  arguments as the corresponding function in the passed object, and will queue
 *  up invocations to the wrapped object's functions.
 */
const serializeObjectOfPromiseFns = obj => {
    const queue = []; // {fn,args}
    let pending = false;
    const result = {};
    const flush = () => {
        if (pending) return;
        if (queue.length === 0) return;
        pending = true;
        const {fn, args} = queue.shift();
        fn(...args).finally(() => {
            pending = false;
            flush();
        });
    };
    for (const k of Object.keys(obj)) {
        result[k] = (...args) => {
            queue.push({fn: obj[k], args});
            flush();
        };
    }
    return result;
};

export default serializeObjectOfPromiseFns;