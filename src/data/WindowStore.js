import { ReduceStore } from "flux/utils";
import Dispatcher from "./dispatcher";
import WindowActions from "./WindowActions";


class WindowStore extends ReduceStore {

    constructor() {
        super(Dispatcher)
    }

    getInitialState() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }

    reduce(state, action) {
        // noinspection JSRedundantSwitchStatement
        switch (action.type) {
            case WindowActions.RESIZE:
                return this.getInitialState();
            default:
                return state;
        }
    }

}

export default new WindowStore();