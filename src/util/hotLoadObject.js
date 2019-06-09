import LoadObject from "./LoadObject";

const hotLoadObject = (
    getLO,
    doLoad,
    shouldLoad = lo => lo.isEmpty() && ! lo.isLoading(),
) => {
    let lo = getLO() || LoadObject.empty();
    if (shouldLoad(lo)) {
        // avoid reentrant dispatch
        setTimeout(() => {
            doLoad();
        }, 0);
    }
    return lo;
};

export default hotLoadObject;
