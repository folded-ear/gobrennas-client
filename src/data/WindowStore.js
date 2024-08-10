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

    isActive() {
        const s = this.getState();
        return s.visible && s.focused;
    }

    isNewVersionAvailable() {
        const s = this.getState().newVersion;
        return s.available && !s.ignored;
    }
}

export default new WindowStore();
