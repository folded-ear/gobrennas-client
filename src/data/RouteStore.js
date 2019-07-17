import { ReduceStore } from "flux/utils"
import Dispatcher from "./dispatcher"
import RouteActions from "./RouteActions"

class RouteStore extends ReduceStore {
    constructor() {
        super(Dispatcher)
    }

    getInitialState() {
        return null
    }

    reduce(state, action) {
        switch (action.type) {

            case RouteActions.MATCH:
                return action.match

            default:
                return state
        }
    }

    hasMatch() {
        return this.getState() != null
    }

    getMatch() {
        return this.getState()
    }

}

export default new RouteStore()