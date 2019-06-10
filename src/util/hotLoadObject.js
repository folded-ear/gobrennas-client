import LoadObject from "./LoadObject";

const hotLoadObject = (
    getLO,
    doLoad,
    shouldLoad = lo => lo.isEmpty() && ! lo.isLoading(),
) => {
    let lo = getLO() || LoadObject.empty();
    if (shouldLoad(lo)) {
        /*
         * This queuing will end up unwinding in a very graceless manner, so
         * don't make a bunch of new hot LOs in a single dispatch cycle. Each
         * one will be loaded as a separate dispatch, likely requeuing all the
         * subsequent items already in the queue. :) There is no "bulk queue",
         * which would address the problem.
         */
        setTimeout(doLoad, 0);
        lo = lo.loading();
    }
    return lo;
};

export default hotLoadObject;
