import { ReduceStore } from "flux/utils";
import Dispatcher from "./dispatcher";
import RouteActions from "./RouteActions";

class RouteStore extends ReduceStore {
    getInitialState() {
        return null;
    }

    reduce(state, action) {
        switch (action.type) {
            case RouteActions.MATCH:
                return action.match;

            default:
                return state;
        }
    }
}

export default new RouteStore(Dispatcher);
