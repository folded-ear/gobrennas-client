const serializePromiseFn = promiseFn => {
    const queue = []
    let pending = false
    const flush = () => {
        if (pending) return
        if (queue.length === 0) return
        pending = true
        promiseFn(...queue.shift())
            .finally(() => {
                pending = false
                flush()
            })
    }
    return (...args) => {
        queue.push(args)
        flush()
    }
}

export default serializePromiseFn