import { ReduceStore } from 'flux/utils'
import Dispatcher from './dispatcher';
import LoadObject from "../util/LoadObject";
import hotLoadObject from "../util/hotLoadObject";
import RecipeActions from "./RecipeActions";
import RecipeApi from "./RecipeApi";
import Recipe from "../models/Recipe";

class DraftRecipeStore extends ReduceStore {
    
    constructor() {
        super(Dispatcher);
    }
    
    getInitialState() {
        return LoadObject.empty();
    }
    
    reduce(state, action) {
        switch (action.type) {
            case RecipeActions.LOAD_DRAFT_RECIPE: {
                return state.setValue(new Recipe()).done();
            }
            
            case RecipeActions.DRAFT_RECIPE_UPDATED: {
                console.log(action.data);
                return state;
            }
            
            case RecipeActions.DRAFT_RECIPE_SAVED: {
                RecipeApi.addRecipe(state.getValueEnforcing());
                return state.done();
            }
            
            default:
                return state;
        }
    }
    
    getDraftRecipeLO() {
        return hotLoadObject(
            () => this.getState(),
            () => Dispatcher.dispatch({
                type: RecipeActions.LOAD_DRAFT_RECIPE,
            }),
        );
    }
}

export default new DraftRecipeStore();