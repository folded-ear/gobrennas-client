import { ReduceStore } from "flux/utils";
import PropTypes from "prop-types";
import typedStore from "../util/typedStore";
import Dispatcher from "./dispatcher";
import LibraryStore from "./LibraryStore";
import PantryItemActions from "./PantryItemActions";
import RecipeActions from "./RecipeActions";
import TaskActions from "./TaskActions";
import TaskStore from "./TaskStore";
import UiActions from "./UiActions";

const enqueue = (state, item) => {
    return {
        ...state,
        queue: state.queue.concat({
            key: Date.now() % 100000 + Math.random(),
            ...item,
        }),
    };
};

class SnackBarStore extends ReduceStore {

    getInitialState() {
        return {
            fabVisible: false,
            queue: [],
        };
    }

    reduce(state, action) {
        switch (action.type) {

            case UiActions.SHOW_FAB: {
                return {
                    ...state,
                    fabVisible: true,
                };
            }

            case UiActions.HIDE_FAB: {
                return {
                    ...state,
                    fabVisible: false,
                };
            }

            case UiActions.DISMISS_SNACKBAR: {
                return {
                    ...state,
                    queue: state.queue.slice(1),
                };
            }

            case TaskActions.SEND_TO_PLAN:
            case PantryItemActions.SEND_TO_PLAN: {
                const plan = TaskStore.getTaskLO(action.planId)
                    .getValueEnforcing();
                return enqueue(state, {
                    message: `Added ${action.name} to ${plan.name}`,
                });
            }

            case RecipeActions.SEND_TO_PLAN: {
                const plan = TaskStore.getTaskLO(action.planId)
                    .getValueEnforcing();
                const recipe = LibraryStore.getIngredientById(action.recipeId)
                    .getValueEnforcing();
                return enqueue(state, {
                    message: `Added ${recipe.name} to ${plan.name}`,
                });
            }

            default:
                return state;
        }
    }

}

SnackBarStore.stateTypes = {
    fabVisible: PropTypes.bool.isRequired,
    queue: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.number.isRequired,
        message: PropTypes.string.isRequired,
        renderAction: PropTypes.func,
        onClose: PropTypes.func,
        hideDelay: PropTypes.number,
    })).isRequired,
};

export default typedStore(new SnackBarStore(Dispatcher));
