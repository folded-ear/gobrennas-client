import { ReduceStore } from "flux/utils";
import Dispatcher from "./dispatcher";
import WindowActions from "./WindowActions";


const getSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
});

class WindowStore extends ReduceStore {

    constructor() {
        super(Dispatcher)
    }

    getInitialState() {
        return {
            ...getSize(),
            newVersionAvailable: false,
            newVersionIgnored: false,
        };
    }

    reduce(state, action) {
        // noinspection JSRedundantSwitchStatement
        switch (action.type) {
            case WindowActions.RESIZE:
                return {
                    ...state,
                    ...getSize(),
                };
            case WindowActions.NEW_VERSION_AVAILABLE:
                return {
                    ...state,
                    newVersionAvailable: true,
                    newVersionIgnored: false,
                };
            case WindowActions.IGNORE_NEW_VERSION:
                return {
                    ...state,
                    newVersionIgnored: true,
                };
            default:
                return state;
        }
    }

    isNewVersionAvailable() {
        const s = this.getState();
        return s.newVersionAvailable && ! s.newVersionIgnored;
    }
}

export default new WindowStore();