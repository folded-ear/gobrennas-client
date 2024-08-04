import Dispatcher from "@/data/dispatcher";
import { askUserToReauth, isAuthError } from "@/providers/Profile";

let helper = (settleKey, typeTemplateOrCallback) => (data) => {
    if (!typeTemplateOrCallback) {
        if (process.env.NODE_ENV !== "production") {
            // eslint-disable-next-line no-console
            console.error(
                "Null 'typeTemplateOrCallback' for in 'promiseFlux' w/ key '" +
                    settleKey +
                    "'",
            );
        }
        return;
    }
    Dispatcher.dispatch(
        typeof typeTemplateOrCallback === "function"
            ? typeTemplateOrCallback(data)
            : typeof typeTemplateOrCallback === "string"
            ? { [settleKey]: data, type: typeTemplateOrCallback }
            : { [settleKey]: data, ...typeTemplateOrCallback },
    );
};

if (process.env.NODE_ENV !== "production") {
    // this will be given jitter of up to 50% in either direction
    const ARTIFICIAL_SETTLEMENT_DELAY = 150;
    if (ARTIFICIAL_SETTLEMENT_DELAY > 0) {
        const oldHelper = helper;
        helper = (k, ttc) => {
            const fast = oldHelper(k, ttc);
            return (data) => {
                const delay =
                    ARTIFICIAL_SETTLEMENT_DELAY * (0.5 + Math.random());
                return setTimeout(() => fast(data), delay);
            };
        };
    }
}

const fallthrough = (error) => ({
    type: "promise-flux/error-fallthrough",
    error,
});

export const soakUpUnauthorized = (error) => {
    if (isAuthError(error)) {
        // eslint-disable-next-line no-console
        console.warn("Unauthorized", error);
        askUserToReauth();
        return fallthrough(error);
    } else {
        throw error;
    }
};

let promiseRejectionCount = 0;

const informUserOfPromiseError = () => {
    promiseRejectionCount++;
    const exp = Math.pow(2, Math.floor(Math.log2(promiseRejectionCount)));
    if (promiseRejectionCount === exp) {
        alert(`Error in Promise; your state is jacked.\n\nCheck the console.`);
    }
};

/**
 * I adapt Promises (which are gross) to Flux actions (which are sexy). The
 * resolve and reject params define what to do when the Promise settles, and can
 * be specified in three different ways:
 *
 * 1.   a String action type, which will be used to create an action Object with
 *      one additional key, either `data` or `error` depending on how the
 *      Promise settled,
 * 1.   an Object action template, which will be spread atop the same `data` or
 *      `error` key described above, or
 * 1.   a Function which accepts the settlement value and returns an action
 *      Object to dispatch.
 *
 * Which style of handler is provided has no impact on the function's behaviour.
 * In particular, there is no way to avoid a dispatch; use a "garbage" action if
 * you truly don't want to know about settlement.
 *
 * @param promise
 * @param resolver
 * @param rejector
 */
const promiseFlux = (
    promise,
    resolver,
    rejector = (error) => {
        // eslint-disable-next-line no-console
        console.error("Error in Promise", error);
        if (!isAuthError(error) || !askUserToReauth()) {
            informUserOfPromiseError();
        }
        return fallthrough(error);
    },
) => promise.then(helper("data", resolver), helper("error", rejector));

export default promiseFlux;
