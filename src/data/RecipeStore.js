import { OrderedMap } from 'immutable';
import { ReduceStore } from 'flux/utils';
import RecipeActions from './RecipeActions';
import Dispatcher from './dispatcher';
import RecipeApi from "./RecipeApi";
import LoadObject from "../util/LoadObject";

class RecipeStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher);
    }
    
    getInitialState() {
        return new OrderedMap({
            sendState: null,
        });
    }
    
    reduce(state, action) {
        switch (action.type) {
            
            case RecipeActions.SEND_INGREDIENTS_TO_TASK_LIST: {
                RecipeApi.addTasksFromIngredients(
                    action.recipeId,
                    action.listId,
                );
                return state.set("sendState", LoadObject.updating());
            }
            
            case RecipeActions.INGREDIENTS_SENT_TO_TASK_LIST: {
                return state.set("sendState", LoadObject.empty());
            }
            
            default:
                return state;
        }
    }
    
    getSendState() {
        return this.getState().get("sendState");
    }

}

export default new RecipeStore();