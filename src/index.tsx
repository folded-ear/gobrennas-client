import { StrictMode } from "react";
import GoBrennas from "./GoBrennas";
import Dispatcher from "@/data/dispatcher";
import WindowActions from "@/data/WindowActions";
import debounce from "@/util/debounce";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// if (!import.meta.env.PROD) {
//     Dispatcher.register(require("./util/logAction").default);
// }

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <GoBrennas />
        </BrowserRouter>
    </StrictMode>,
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
