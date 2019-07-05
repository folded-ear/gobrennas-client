import {OrderedMap,} from 'immutable';
import {ReduceStore} from 'flux/utils';
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
            selected: null,
            sendState: null,
        });
    }
    
    reduce(state, action) {
        switch (action.type) {
            
            case RecipeActions.SELECT_RECIPE: {
                return state.set('selected', action.id)
            }
    
            case RecipeActions.RECIPE_DELETED: {
                return state.set('selected', null)
            }
    
            case RecipeActions.SEND_RAW_INGREDIENTS_TO_TASK_LIST: {
                RecipeApi.addTasksFromRawIngredients(
                    action.recipeId,
                    action.listId,
                );
                return state.set("sendState", LoadObject.updating());
            }
            
            case RecipeActions.RAW_INGREDIENTS_SENT_TO_TASK_LIST: {
                return state.set("sendState", LoadObject.empty());
            }
            
            default:
                return state;
        }
    }
    
    getSelectedRecipe() {
        return this.getState().get('selected');
    }

    getSendState() {
        return this.getState().get("sendState");
    }

}

export default new RecipeStore();