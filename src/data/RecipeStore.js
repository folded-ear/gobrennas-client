import { ReduceStore } from 'flux/utils';
import { OrderedMap } from 'immutable';
import history from "../util/history";
import LoadObject from "../util/LoadObject";
import Dispatcher from './dispatcher';
import RecipeActions from './RecipeActions';
import RecipeApi from "./RecipeApi";

export const buildRecipe = recipe => {
    recipe.type = "Recipe";
    delete recipe.rawIngredients;
    return recipe;
};

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
            
            case RecipeActions.CREATE_RECIPE: {
                RecipeApi.addRecipe(buildRecipe(action.data));
                return state;
            }
            
            case RecipeActions.UPDATE_RECIPE: {
                RecipeApi.updateRecipe(buildRecipe(action.data));
                return state;
            }

            case RecipeActions.RECIPE_DELETED: {
                history.push("/library");
                return state;
            }
            
            case RecipeActions.ASSEMBLE_SHOPPING_LIST: {
                RecipeApi.assembleShoppingList(
                    action.recipeIds,
                    action.listId,
                );
                return state.set("sendState", LoadObject.updating());
            }

            case RecipeActions.SEND_TO_SHOPPING_LIST: {
                RecipeApi.sendToShoppingList(
                    action.recipeId,
                    action.listId,
                );
                return state.set("sendState", LoadObject.updating());
            }

            case RecipeActions.SHOPPING_LIST_ASSEMBLED:
            case RecipeActions.SHOPPING_LIST_SENT: {
                return state.set("sendState", LoadObject.empty());
            }

            case RecipeActions.RAW_INGREDIENT_DISSECTED: {
                RecipeApi.recordIngredientDissection(
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