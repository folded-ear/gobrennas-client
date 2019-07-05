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

        case RecipeActions.FETCH_RECIPES: {
        let recipes = List(action.data.map(recipe => {
          return (new Recipe({
            id: recipe.ingredientId,
            title: recipe.title,
            external_url: recipe.external_url,
            ingredients: recipe.ingredients.map(ingredient => {
              return new IngredientRef({
                id: ingredient.ingredientId,
                quantity: ingredient.quantity,
                preparation: ingredient.preparation,
                ingredient: new Ingredient({
                  name: ingredient.ingredient.name
                })
              })
            }),
            rawIngredients: recipe.rawIngredients,
            directions: recipe.directions
          }))
        }));

            return state.setIn(['library'], recipes);
      }

        case RecipeActions.ADD_RECIPE: {
        if (!action.data) {
          return state;
        }
        return state.set('library', state.get('library').push(action.data));
      }

        case RecipeActions.DELETE_RECIPE: {
        const index = state.get('library').findIndex(recipe => recipe.get('id') === action.id);

            if (index >= 0) {
          return state
            .set('selected', null)
            .set('library', state.get('library').remove(index));
        }
        return state;
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