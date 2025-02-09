import { ReduceStore } from "flux/utils";
import dispatcher, { ActionType, FluxAction } from "./dispatcher";

export interface WindowSize {
    width: number;
    height: number;
}

interface State {
    size: WindowSize;
    focused: boolean;
    visible: boolean;
}

class WindowStore extends ReduceStore<State, FluxAction> {
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

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case ActionType.WINDOW__RESIZE:
                return {
                    ...state,
                    size: action.size,
                };
            case ActionType.WINDOW__VISIBILITY_CHANGE:
                return {
                    ...state,
                    visible: action.visible,
                };
            case ActionType.WINDOW__FOCUS_CHANGE:
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

export default new WindowStore(dispatcher);
