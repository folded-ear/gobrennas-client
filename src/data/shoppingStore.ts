import planStore from "features/Planner/data/planStore";
import {ReduceStore} from "flux/utils";
import {ShopItemType} from "views/shop/ShopList";
import Dispatcher from "./dispatcher";
import PantryItemActions from "./PantryItemActions";
import ShoppingActions from "./ShoppingActions";
import {FluxAction} from "global/types/types";
import PlanActions from "../features/Planner/data/PlanActions";
import {removeDistinct, toggleDistinct} from "../util/arrayAsSet";

const placeFocus = (state, id, type) => ({
    ...state,
    activeItem: {
        id,
        type,
    },
});

export interface Item {
    id: number
    type: ShopItemType
}

interface State {
    activePlanIds?: number[]
    activeItem?: Item
    expandedId?: number
}

class ShoppingStore extends ReduceStore<State, FluxAction> {

    getInitialState(): State {
        return {};
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {

            case PlanActions.PLAN_DELETED:
                return {
                    ...state,
                    activePlanIds: removeDistinct(
                        state.activePlanIds,
                        action.id),
                };

            case ShoppingActions.TOGGLE_PLAN: {
                const activePlanIds = toggleDistinct(
                    state.activePlanIds?.slice(),
                    action.id);
                if (activePlanIds.length === 0) {
                    activePlanIds.push(planStore.getActivePlanLO()
                        .getValueEnforcing()
                        .id);
                }
                return {
                    ...state,
                    activePlanIds,
                };
            }

            case ShoppingActions.CREATE_ITEM_AFTER:
            case ShoppingActions.CREATE_ITEM_BEFORE:
            case ShoppingActions.CREATE_ITEM_AT_END:
            case ShoppingActions.DELETE_ITEM_BACKWARDS:
            case ShoppingActions.DELETE_ITEM_FORWARD: {
                this.__dispatcher.waitFor([
                    planStore.getDispatchToken(),
                ]);
                state = placeFocus(state, planStore.getActiveItem().id, ShopItemType.PLAN_ITEM);
                return state;
            }

            case ShoppingActions.FOCUS: {
                state = placeFocus(state, action.id, action.itemType);
                if (action.itemType === ShopItemType.INGREDIENT) {
                    state.expandedId = state.expandedId === action.id
                        ? undefined
                        : action.id;
                }
                return state;
            }

            case PantryItemActions.ORDER_FOR_STORE: {
                return {
                    ...state,
                    activeItem: {
                        id: action.id,
                        type: ShopItemType.INGREDIENT,
                    },
                };
            }

            case ShoppingActions.TOGGLE_EXPANDED: {
                return {
                    ...state,
                    expandedId: state.expandedId === action.id
                        ? undefined
                        : action.id,
                };
            }

            case ShoppingActions.SET_INGREDIENT_STATUS: {
                return {
                    ...state,
                    expandedId: state.expandedId === action.id
                        ? undefined
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

    getActivePlanIds() {
        return this.getState().activePlanIds;
    }
}

export default new ShoppingStore(Dispatcher);
