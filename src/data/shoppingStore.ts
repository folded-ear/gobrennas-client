import planStore from "@/features/Planner/data/planStore";
import { ReduceStore } from "flux/utils";
import { ShopItemType } from "@/views/shop/ShopList";
import dispatcher, { FluxAction } from "./dispatcher";
import PantryItemActions from "./PantryItemActions";
import ShoppingActions from "./ShoppingActions";
import PlanActions from "@/features/Planner/data/PlanActions";
import { removeDistinct, toggleDistinct } from "@/util/arrayAsSet";
import preferencesStore from "./preferencesStore";
import PlanApi from "@/features/Planner/data/PlanApi";
import { BfsId, bfsIdEq, includesBfsId } from "@/global/types/identity";

export interface Item {
    id: BfsId;
    type: ShopItemType;
}

interface State {
    activePlanIds?: BfsId[];
    activeItem?: Item;
    expandedId?: BfsId;
}

const placeFocus = (state: State, id: BfsId, type): State => ({
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
            case PlanActions.PLAN_DELETED:
                return {
                    ...state,
                    activePlanIds: removeDistinct(
                        state.activePlanIds,
                        action.id,
                    ),
                };

            case PlanActions.PLANS_LOADED: {
                this.getDispatcher().waitFor([planStore.getDispatchToken()]);
                const validPlanIds = planStore
                    .getPlanIdsLO()
                    .getValueEnforcing();
                const activePlanId = planStore
                    .getActivePlanLO()
                    .getValueEnforcing().id;
                const shopIds: BfsId[] = [];
                for (const id of preferencesStore.getActiveShoppingPlans()) {
                    if (!includesBfsId(validPlanIds, id)) continue;
                    shopIds.push(id);
                    if (bfsIdEq(id, activePlanId)) continue;
                    // load up its items, so we can shop for them
                    PlanApi.getDescendantsAsList(id);
                }
                return {
                    ...state,
                    activePlanIds: shopIds,
                };
            }

            case ShoppingActions.TOGGLE_PLAN: {
                const activePlanIds = toggleDistinct(
                    state.activePlanIds?.slice(),
                    action.id,
                );
                if (activePlanIds.length === 0) {
                    activePlanIds.push(
                        planStore.getActivePlanLO().getValueEnforcing().id,
                    );
                }
                if (includesBfsId(activePlanIds, action.id)) {
                    // it was toggled on
                    PlanApi.getDescendantsAsList(action.id);
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
                this.__dispatcher.waitFor([planStore.getDispatchToken()]);
                state = placeFocus(
                    state,
                    planStore.getActiveItem()!.id,
                    ShopItemType.PLAN_ITEM,
                );
                return state;
            }

            case ShoppingActions.FOCUS: {
                state = placeFocus(state, action.id, action.itemType);
                if (action.itemType === ShopItemType.INGREDIENT) {
                    state.expandedId = bfsIdEq(state.expandedId, action.id)
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
                    expandedId: bfsIdEq(state.expandedId, action.id)
                        ? undefined
                        : action.id,
                };
            }

            case ShoppingActions.SET_INGREDIENT_STATUS: {
                return {
                    ...state,
                    expandedId: bfsIdEq(state.expandedId, action.id)
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
