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
            
            case RecipeActions.ASSEMBLE_SHOPPING_LIST: {
                RecipeApi.assembleShoppingList(
                    action.recipeId,
                    action.listId,
                );
                return state.set("sendState", LoadObject.updating());
            }
            
            case RecipeActions.SHOPPING_LIST_ASSEMBLED: {
                return state.set("sendState", LoadObject.empty());
            }

            case RecipeActions.RAW_INGREDIENT_DISSECTED: {
                RecipeApi.recordIngredientDissection(
                    action.recipeId,
                    action.raw,
                    action.quantity,
                    action.units,
                    action.name,
                    action.prep,
                );
                return state;
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