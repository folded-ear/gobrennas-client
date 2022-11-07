import Dispatcher from "data/dispatcher";

/*
 * I am an attempt to provide a graceful way to hook actions from w/in action
 * creators. This fulfills the role that middleware does in Redux, where special
 * types of actions are not sent to the reducers, but instead manage their own
 * orthogonal state.
 *
 * An ajax call is a good example: dispatch a thunk from your action creator,
 * which is intercepted. Immediately dispatch a "real" action from the thunk
 * that says it's starting, kick off the XHR, and when it returns dispatch
 * another "real" action that says it's done w/ the appropriate data from the
 * response (good or bad).
 *
 * There are a few problems with this:
 *
 * 1.   Dispatching a non-action (the thunk) is non-intuitive. The dispatcher
 *      shouldn't be doing two different things like that. If you need a thunk,
 *      just invoke it, there's no benefit to sending it to the Dispatcher for
 *      it to invoke, and it muddies program flow considerably.
 * 1.   Every piece of data used by the thunk must be manually synced to a store
 *      via a "real" action, otherwise the data is locked away in that opaque
 *      thunk, and the application cannot access it. This includes the XHR
 *      object itself! So even in the simple case above, the XHR has to be sent
 *      out via an action, as well as status updates from the XHR.
 * 1.   Pure reducers are a great ideal, but the real world never lets that
 *      level of purity in. Middleware is a way to keep reducers pure, by moving
 *      all the impure logic out of them. While this is a reasonable approach in
 *      some cases, having it forced upon you creates problems. Only the
 *      programmer can know what tradeoffs best suit their application.
 *
 * This function provides an alternate way of expressing the same sort of flow,
 * but in a Flux-centric way (not an arbitrary non-Flux middleware), and without
 * the problems listed above.
 *
 * Reusing the ajax call example: dispatch an action from your action creator
 * which will cause the request to be initiated. Then wire an `onNextActionThat`
 * to be invoked on the action which is dispatched when the XHR returns, and
 * do "whatever". This is a much smaller amount of work to be done, because our
 * stores are much more powerful, and do much of the work instead of forcing
 * what amounts to a view-layer construct (the action creator) to implement the
 * business logic.
 *
 * It also creates a very crisp line between behaviors that the dispatcher
 * itself enforces: you can't dispatch actions in the work callback. Contrast
 * with a thunk, you can go back to the reducers at any time, mixing the managed
 * state and the async operations together and losing one-way data flow.
 *
 * The primary downside is that your action creator must know about the shape of
 * actions which _it doesn't create_. In effect, the work callback is doing
 * exactly what the thunk was doing: moving business logic out of Flux's one-way
 * data flow and into an extra orthogonal loop.
 */
const onNextActionThat = (test, work) => {
    const token = Dispatcher.register(actPay => {
        if (test(actPay)) {
            Dispatcher.unregister(token);
            work(actPay);
        }
    });
};

export default onNextActionThat;