import { ReduceStore } from "flux/utils";
import PropTypes from "prop-types";
import { toggleDistinct } from "../util/arrayAsSet";
import { clientOrDatabaseIdType } from "../util/ClientId";
import typedStore from "../util/typedStore";
import Dispatcher from "./dispatcher";
import PlanActions from "./PlanActions";
import PlanStore from "./PlanStore";
import PreferencesStore from "./PreferencesStore";
import ShoppingActions from "./ShoppingActions";

class ShoppingStore extends ReduceStore {

    getInitialState() {
        const apid = PreferencesStore.getActivePlan();
        return {
            selectedPlanIds: apid ? [apid] : [], // Array<ID>
            activeItem: null, // {id: ID, type: String}
            expandedId: null, // ID
        };
    }

    reduce(state, action) {
        switch (action.type) {

            case PlanActions.SELECT_PLAN: {
                return {
                    ...state,
                    selectedPlanIds: [action.id],
                };
            }

            case ShoppingActions.TOGGLE_PLAN: {
                return {
                    ...state,
                    selectedPlanIds: toggleDistinct(state.selectedPlanIds, action.id),
                };
            }

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

    getAllPlans() {
        const lo = PlanStore.getPlans();
        if (!lo.hasValue()) return lo;
        const s = this.getState();
        return lo.map(plans =>
            plans.map(p => ({
                ...p,
                selected: s.selectedPlanIds.includes(p.id),
            })));
    }

    getActiveItem() {
        return this.getState().activeItem;
    }

    getExpandedIngredientId() {
        return this.getState().expandedId;
    }

}

ShoppingStore.stateTypes = {
    selectedPlanIds: PropTypes.arrayOf(clientOrDatabaseIdType).isRequired,
    activeItem: PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.oneOf(["ingredient", "task"]).isRequired,
    }),
    expandedId: PropTypes.number,
};

export default typedStore(new ShoppingStore(Dispatcher));
