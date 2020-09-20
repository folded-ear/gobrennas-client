import { ReduceStore } from "flux/utils";
import PropTypes from "prop-types";
import {
    removeDistinct,
    toggleDistinct,
} from "../util/arrayAsSet";
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
            expandedIds: [], // Array<ID>
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
                return {
                    ...state,
                    activeItem: {
                        id: action.id,
                        type: action.itemType,
                    },

                };
            }

            case ShoppingActions.TOGGLE_EXPANDED: {
                return {
                    ...state,
                    expandedIds: toggleDistinct(state.expandedIds, action.id),
                };
            }

            case ShoppingActions.SET_INGREDIENT_STATUS: {
                return {
                    ...state,
                    expandedIds: removeDistinct(state.expandedIds, action.id),
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

    isIngredientExpanded(id) {
        return this.getState().expandedIds.indexOf(id) >= 0;
    }

}

ShoppingStore.stateTypes = {
    selectedPlanIds: PropTypes.arrayOf(clientOrDatabaseIdType).isRequired,
    activeItem: PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.oneOf(["ingredient", "task"]).isRequired,
    }),
    expandedIds: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default typedStore(new ShoppingStore(Dispatcher));
