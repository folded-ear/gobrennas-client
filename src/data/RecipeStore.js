import { ReduceStore } from "flux/utils";
import history from "../util/history";
import { toMilliseconds } from "../util/time";
import Dispatcher from "./dispatcher";
import RecipeActions from "./RecipeActions";
import RecipeApi from "./RecipeApi";

export const buildRecipe = recipe => {
    recipe.type = "Recipe";
    recipe.totalTime = toMilliseconds(recipe.totalTime);
    delete recipe.rawIngredients;
    return recipe;
};

class RecipeStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher);
    }
    
    getInitialState() {
        return {};
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
            
            case RecipeActions.SEND_TO_PLAN: {
                RecipeApi.sendToPlan(
                    action.recipeId,
                    action.planId,
                );
                return state;
            }

            case RecipeActions.SENT_TO_PLAN: {
                return state;
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

}

export default new RecipeStore();
