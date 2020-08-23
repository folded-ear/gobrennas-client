import { ReduceStore } from "flux/utils";
import Dispatcher from "./dispatcher";
import WindowActions from "./WindowActions";

class WindowStore extends ReduceStore {

    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return {
            size: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            focused: true,
            visible: true,
            newVersion: {
                available: false,
                ignored: false,
                waitingWorker: null,
            },
        };
    }

    reduce(state, action) {
        // noinspection JSRedundantSwitchStatement
        switch (action.type) {
            case WindowActions.RESIZE:
                return {
                    ...state,
                    size: action.size,
                };
            case WindowActions.VISIBILITY_CHANGE:
                return {
                    ...state,
                    visible: action.visible,
                };
            case WindowActions.FOCUS_CHANGE:
                return {
                    ...state,
                    focused: action.focused,
                };
            case WindowActions.NEW_VERSION_AVAILABLE:
                return {
                    ...state,
                    newVersion: {
                        available: true,
                        waitingWorker: action.registration.waiting,
                        ignored: false,
                    },
                };
            case WindowActions.IGNORE_NEW_VERSION:
                return {
                    ...state,
                    newVersion: {
                        ...state.newVersion,
                        ignored: true,
                    },
                };

            case WindowActions.LAUNCH_NEW_VERSION: {
                // this dance is based on:
                // https://github.com/facebook/create-react-app/issues/5316#issuecomment-496292914
                const waitingWorker = state.newVersion.waitingWorker;
                if (waitingWorker) {
                    waitingWorker.addEventListener("statechange", event => {
                        if (event.target.state === "activated") {
                            window.location.reload();
                        }
                    });
                    waitingWorker.postMessage({type: "SKIP_WAITING"});
                }
                return state;
            }

            default:
                return state;
        }
    }

    getSize() {
        return this.getState().size;
    }

    isVisible() {
        return this.getState().visible;
    }

    isFocused() {
        return this.getState().focused;
    }

    isNewVersionAvailable() {
        const s = this.getState().newVersion;
        return s.available && !s.ignored;
    }

}

export default new WindowStore();