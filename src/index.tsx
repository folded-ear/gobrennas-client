import PlanItemSynchronizer from "@/features/Planner/data/PlanItemSynchronizer";
import { ApolloClient } from "@/providers/ApolloClient";
import { AuthTokenProvider } from "@/providers/AuthToken";
import { IsMobileProvider } from "@/providers/IsMobile";
import { ProfileProvider } from "@/providers/Profile";
import React from "react";
import ReactDOM from "react-dom";
import { QueryClientProvider } from "react-query";
import { Router } from "react-router-dom";
import App from "./App";
import Dispatcher from "@/data/dispatcher";
import PantryItemSynchronizer from "@/data/PantryItemSynchronizer";
import queryClient from "@/data/queryClient";
import WindowActions from "@/data/WindowActions";
import debounce from "@/util/debounce";
import history from "@/util/history";

// if (!import.meta.env.PROD) {
//     Dispatcher.register(require("./util/logAction").default);
// }

ReactDOM.render(
    [
        React.StrictMode,
        ApolloClient,
        AuthTokenProvider,
        ProfileProvider,
        IsMobileProvider,
    ].reduceRight(
        (kids, Decorator) => <Decorator>{kids}</Decorator>,
        <QueryClientProvider client={queryClient}>
            <Router history={history}>
                <PantryItemSynchronizer />
                <PlanItemSynchronizer />
                <App />
            </Router>
        </QueryClientProvider>,
    ),
    document.getElementById("root"),
);

/*
 * From here on down, we're wiring up the environment as an actor on the system.
 */

window.addEventListener(
    "resize",
    debounce(
        () =>
            Dispatcher.dispatch({
                type: WindowActions.RESIZE,
                size: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
            }),
        250,
    ),
);

window.addEventListener("focus", () => {
    if (Dispatcher.isDispatching()) {
        // eslint-disable-next-line no-console
        console.warn("reentrant focus dispatch");
        return;
    }
    Dispatcher.dispatch({
        type: WindowActions.FOCUS_CHANGE,
        focused: true,
    });
});

window.addEventListener("blur", () =>
    Dispatcher.dispatch({
        type: WindowActions.FOCUS_CHANGE,
        focused: false,
    }),
);

document.addEventListener("visibilitychange", () =>
    Dispatcher.dispatch({
        type: WindowActions.VISIBILITY_CHANGE,
        visible: !document.hidden,
    }),
);
