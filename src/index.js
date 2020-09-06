import React from "react";
import ReactDOM from "react-dom";
import { Router } from "react-router-dom";
import App from "./App";
import Dispatcher from "./data/dispatcher";
import TemporalActions from "./data/TemporalActions";
import WindowActions from "./data/WindowActions";
import * as serviceWorker from "./serviceWorker";
import debounce from "./util/debounce";
import history from "./util/history";
import logAction from "./util/logAction";

if (process.env.NODE_ENV !== "production") {
    Dispatcher.register(logAction);
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

window.addEventListener("focus", () =>
    Dispatcher.dispatch({
        type: WindowActions.FOCUS_CHANGE,
        focused: true,
    }));

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

{
    let last = new Date();
    setInterval(() => {
        const now = new Date();
        Dispatcher.dispatch({type: TemporalActions.EVERY_15_SECONDS});
        if (last.getMinutes() !== now.getMinutes()) {
            Dispatcher.dispatch({type: TemporalActions.EVERY_MINUTE});
        }
        if (last.getHours() !== now.getHours()) {
            Dispatcher.dispatch({type: TemporalActions.EVERY_HOUR});
            if (last.getHours() < 6 && now.getHours() >= 6) {
                // i have decreed that the morning starts at 6am!
                Dispatcher.dispatch({type: TemporalActions.EVERY_MORNING});
            }
            if (last.getHours() < 12 && now.getHours() >= 12) {
                // it's pretty well accepted that afternoon starts at noon
                Dispatcher.dispatch({type: TemporalActions.EVERY_AFTERNOON});
            }
            if (last.getHours() < 17 && now.getHours() >= 17) {
                // i have decreed that the evening starts at 5pm!
                Dispatcher.dispatch({type: TemporalActions.EVERY_EVENING});
            }
            if (last.getHours() < 21 && now.getHours() >= 21) {
                // i have decreed that night starts at 9pm!
                Dispatcher.dispatch({type: TemporalActions.EVERY_NIGHT});
            }
        }
        if (last.getDate() !== now.getDate()) {
            Dispatcher.dispatch({type: TemporalActions.EVERY_DAY});
        }
        last = now;
    }, 1000 * 15);
}

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
