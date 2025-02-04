import { ReduceStore } from "flux/utils";
import Dispatcher from "./dispatcher";
import WindowActions from "./WindowActions";
import { FluxAction } from "@/global/types/types";

interface WindowSize {
    width: number;
    height: number;
}

interface State {
    size: WindowSize;
    focused: boolean;
    visible: boolean;
}

class WindowStore extends ReduceStore<State, FluxAction> {
    constructor() {
        super(Dispatcher);
    }

    getInitialState(): State {
        return {
            size: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            focused: true,
            visible: true,
        };
    }

    reduce(state: State, action): State {
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

    getSize(): WindowSize {
        return this.getState().size;
    }

    isVisible(): boolean {
        return this.getState().visible;
    }

    isFocused(): boolean {
        return this.getState().focused;
    }
}

export default new WindowStore();
