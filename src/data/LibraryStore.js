import { ReduceStore } from 'flux/utils'
import Dispatcher from './dispatcher'
import {OrderedMap} from "immutable";
import LoadObject from "../util/LoadObject";

class LibraryStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher)
    }
    
    getInitialState() {
        return new OrderedMap({
            recipes: LoadObject.empty() // LoadObject<Array<Recipe>
        })
    }
    
    reduce(state, action) {
        
        switch(action.type) {
            default: {
                return state
            }
        }
    }
}