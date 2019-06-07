import { ReduceStore } from "flux/utils";
import Dispatcher from './dispatcher';

class TaskStore extends ReduceStore {
    constructor() {
        super(Dispatcher);
    }

    getInitialState() {
        return "world";
    }


    reduce(state, action) {
        switch (action.type) {
            default:
                return state;
        }
    }
}

export default new TaskStore();