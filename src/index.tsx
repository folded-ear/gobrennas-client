import { StrictMode } from "react";
import GoBrennas from "./GoBrennas";
import dispatcher from "@/data/dispatcher";
import debounce from "@/util/debounce";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// import logAction from "./util/logAction";
// if (import.meta.env.DEV) {
//     dispatcher.register(logAction);
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
            dispatcher.dispatch({
                type: "window/resize",
                size: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
            }),
        250,
    ),
);

window.addEventListener("focus", () => {
    if (dispatcher.isDispatching()) {
        // eslint-disable-next-line no-console
        console.warn("reentrant focus dispatch");
        return;
    }
    dispatcher.dispatch({
        type: "window/focus-change",
        focused: true,
    });
});

window.addEventListener("blur", () =>
    dispatcher.dispatch({
        type: "window/focus-change",
        focused: false,
    }),
);

document.addEventListener("visibilitychange", () =>
    dispatcher.dispatch({
        type: "window/visibility-change",
        visible: !document.hidden,
    }),
);
