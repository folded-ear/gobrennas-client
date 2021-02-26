import FluxContainerSubscriptions from "flux/lib/FluxContainerSubscriptions";
import React from "react";

/**
 * I replace Flux Utils' Container concept with a hook. This not only allows for
 * functional components in the hook style, but also avoids Container's
 * dependence on deprecated (and to be obsoleted) React lifecycles.
 *
 * My signature is reminiscent of useEffect, useMemo, and useState. Like
 * useEffect, there's a subscription created (and canceled/recreated) against
 * the passed stores. Like useMemo, there is a callback which computes a value
 * based on the passed stores and dependencies. Like useState, the callback will
 * be passed the prior state, should it wish to either return it as-is or
 * compute a delta. Note that _unlike_ Flux Utils Containers, props and context
 * are not provided to the callback; it's up to the caller of the hook to close
 * over them if needed.
 *
 * My return value is exactly like useMemo or useState: the callback's result.
 *
 * ***NB:*** Flux Utils' Container recalculates in componentWillReceiveProps if
 * the `{withProps: true}` flag is passed. `useFluxStore`, on the other hand,
 * uses a dependencies array like the built-in hooks (`useEffect`, `useMemo`,
 * etc.). That is, you have to actually manage your dependencies with the hook,
 * you can't just rely on Flux Utils to madly recalculate all the time.
 *
 * @param calculateState The callback for calculating the next state. This is
 *  the same as was passed to `Container.create`.
 * @param stores An array of stores to listen for changes to. This is the same
 *  as what the `getStores` passed to `Container.create` would return.
 * @param deps An array of dependencies that your calculateState function uses.
 *  This is like what you'd pass to useEffect or useMemo.
 * @return The current calculated state.
 */
const useFluxStore = (calculateState, stores, deps = []) => {
    const [state, setState] = React.useState(calculateState);
    React.useEffect(
        () => {
            const subs = new FluxContainerSubscriptions();
            subs.setStores(stores);
            subs.addListener(() => setState(calculateState));
            setState(calculateState);
            return () => subs.reset();
        },
        stores.concat(deps), // eslint-disable-line react-hooks/exhaustive-deps
    );
    return state;
};

export default useFluxStore;
