import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import App from "./App";
import Dispatcher from "./data/dispatcher";
import WindowActions from "./data/WindowActions";
import * as serviceWorker from "./serviceWorker";
import debounce from "./util/debounce";
import history from "./util/history";

if (process.env.NODE_ENV === "development") {
    Dispatcher.register(require("./util/logAction").default);
}

ReactDOM.render(<Router history={history}><App /></Router>, document.getElementById("root"));

/*
 * From here on down, we're wiring up the environment as an actor on the system.
 */

window.addEventListener("resize", debounce(() =>
    Dispatcher.dispatch({
        type: WindowActions.RESIZE,
        size: {
            width: window.innerWidth,
            height: window.innerHeight,
        },
    }), 250));

window.addEventListener("focus", () => {
    try {
        Dispatcher.dispatch({
            type: WindowActions.FOCUS_CHANGE,
            focused: true,
        });
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("reentrant focus dispatch");
    }
});

window.addEventListener("blur", () =>
    Dispatcher.dispatch({
        type: WindowActions.FOCUS_CHANGE,
        focused: false,
    }));

document.addEventListener("visibilitychange", () =>
    Dispatcher.dispatch({
        type: WindowActions.VISIBILITY_CHANGE,
        visible: !document.hidden,
    }));

// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register({
    // called when the cache is populated (i.e., offline will work)
    onSuccess: registration => Dispatcher.dispatch({
        type: WindowActions.PWA_CACHE_HOT,
        registration,
    }),
    // called when there is a new version of the app available
    onUpdate: registration => Dispatcher.dispatch({
        type: WindowActions.NEW_VERSION_AVAILABLE,
        registration,
    }),
});

if (process.env.NODE_ENV !== "production") {
    document.body.style.setProperty("background-image", "repeating-linear-gradient(\n" +
        "20deg,\n" +
        "transparent,\n" +
        "transparent 88px,\n" +
        "hsl(300, 100%, 95%) 88px,\n" +
        "hsl(250, 100%, 95%) 90px\n" +
        ")");
}
