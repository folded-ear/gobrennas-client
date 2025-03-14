import PlanApi from "@/features/Planner/data/PlanApi";
import planStore from "@/features/Planner/data/planStore";
import { BfsId } from "@/global/types/identity";
import { removeDistinct, toggleDistinct } from "@/util/arrayAsSet";
import { ShopItemType } from "@/views/shop/ShopList";
import { ReduceStore } from "flux/utils";
import dispatcher, { ActionType, FluxAction } from "./dispatcher";
import preferencesStore from "./preferencesStore";

export interface Item {
    id: BfsId;
    type: ShopItemType;
}

interface State {
    activePlanIds?: BfsId[];
    activeItem?: Item;
    expandedId?: BfsId;
}

const placeFocus = (state: State, id: BfsId, type: ShopItemType): State => ({
    ...state,
    activeItem: {
        id,
        type,
    },
});

class ShoppingStore extends ReduceStore<State, FluxAction> {
    getInitialState(): State {
        return {};
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case ActionType.PLAN__PLAN_DELETED:
                return {
                    ...state,
                    activePlanIds: removeDistinct(
                        state.activePlanIds,
                        action.id,
                    ),
                };

            case ActionType.PLAN__PLANS_LOADED: {
                this.getDispatcher().waitFor([planStore.getDispatchToken()]);
                const validPlanIds = planStore
                    .getPlanIdsLO()
                    .getValueEnforcing();
                const activePlanId = planStore
                    .getActivePlanLO()
                    .getValueEnforcing().id;
                const shopIds: BfsId[] = [];
                for (const id of preferencesStore.getActiveShoppingPlans()) {
                    if (!validPlanIds.includes(id)) continue;
                    shopIds.push(id);
                    if (id === activePlanId) continue;
                    // load up its items, so we can shop for them
                    PlanApi.getDescendantsAsList(id);
                }
                return {
                    ...state,
                    activePlanIds: shopIds,
                };
            }

            case ActionType.SHOPPING__TOGGLE_PLAN: {
                const activePlanIds = toggleDistinct(
                    state.activePlanIds?.slice(),
                    action.id,
                );
                if (activePlanIds.length === 0) {
                    activePlanIds.push(
                        planStore.getActivePlanLO().getValueEnforcing().id,
                    );
                }
                if (activePlanIds.includes(action.id)) {
                    // it was toggled on
                    PlanApi.getDescendantsAsList(action.id);
                }
                return {
                    ...state,
                    activePlanIds,
                };
            }

            case ActionType.SHOPPING__CREATE_ITEM_BEFORE:
            case ActionType.SHOPPING__CREATE_ITEM_AFTER:
            case ActionType.SHOPPING__CREATE_ITEM_AT_END:
            case ActionType.SHOPPING__DELETE_ITEM_BACKWARD:
            case ActionType.SHOPPING__DELETE_ITEM_FORWARD: {
                this.__dispatcher.waitFor([planStore.getDispatchToken()]);
                state = placeFocus(
                    state,
                    planStore.getActiveItem()!.id,
                    ShopItemType.PLAN_ITEM,
                );
                return state;
            }

            case ActionType.SHOPPING__FOCUS_ITEM: {
                state = placeFocus(state, action.id, action.itemType);
                if (action.itemType === ShopItemType.INGREDIENT) {
                    state.expandedId =
                        state.expandedId === action.id ? undefined : action.id;
                }
                return state;
            }

            case ActionType.PANTRY_ITEM__ORDER_FOR_STORE: {
                return {
                    ...state,
                    activeItem: {
                        id: action.id,
                        type: ShopItemType.INGREDIENT,
                    },
                };
            }

            case ActionType.SHOPPING__TOGGLE_EXPANDED: {
                return {
                    ...state,
                    expandedId:
                        state.expandedId === action.id ? undefined : action.id,
                };
            }

            case ActionType.SHOPPING__SET_INGREDIENT_STATUS: {
                return {
                    ...state,
                    expandedId:
                        state.expandedId === action.id
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

export default new ShoppingStore(dispatcher);
