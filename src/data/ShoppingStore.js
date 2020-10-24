import { ReduceStore } from "flux/utils";
import PropTypes from "prop-types";
import typedStore from "../util/typedStore";
import Dispatcher from "./dispatcher";
import PantryItemActions from "./PantryItemActions";
import ShoppingActions from "./ShoppingActions";

class ShoppingStore extends ReduceStore {

    getInitialState() {
        return {
            activeItem: null, // {id: ID, type: String}
            expandedId: null, // ID
        };
    }

    reduce(state, action) {
        switch (action.type) {

            case ShoppingActions.FOCUS: {
                state = {
                    ...state,
                    activeItem: {
                        id: action.id,
                        type: action.itemType,
                    },
                };
                if (action.itemType === "ingredient") {
                    state.expandedId = state.expandedId === action.id
                        ? null
                        : action.id;
                }
                return state;
            }

            case PantryItemActions.ORDER_FOR_STORE: {
                return {
                    ...state,
                    activeItem: {
                        id: action.id,
                        type: "ingredient",
                    },
                };
            }

            case ShoppingActions.TOGGLE_EXPANDED: {
                return {
                    ...state,
                    expandedId: state.expandedId === action.id
                        ? null
                        : action.id,
                };
            }

            case ShoppingActions.SET_INGREDIENT_STATUS: {
                return {
                    ...state,
                    expandedId: state.expandedId === action.id
                        ? null
                        : state.expandedId,
                };
            }

            default:
                return state;
        }
    }

    getActiveItem() {
        return this.getState().activeItem;
    }

    getExpandedIngredientId() {
        return this.getState().expandedId;
    }

}

ShoppingStore.stateTypes = {
    activeItem: PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.oneOf(["ingredient", "task"]).isRequired,
    }),
    expandedId: PropTypes.number,
};

export default typedStore(new ShoppingStore(Dispatcher));
