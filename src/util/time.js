export const toMilliseconds = (time) => {
    if(!time) { return null }
    return time * 60 * 1000;
}

export const fromMilliseconds = (time) => {
    if(!time) { return null }
    return time / (60 * 1000);
}
