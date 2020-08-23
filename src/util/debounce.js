const debounce = (fn, delay = 100) => {
    let timeout = null;
    return (...args) => {
        if (timeout != null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            timeout = null;
            fn(...args);
        }, delay);
    };
};

export default debounce;