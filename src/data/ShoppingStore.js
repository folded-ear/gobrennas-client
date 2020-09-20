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
            activeId: null, // ID
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
                    activeId: action.id,
                };
            }

            case ShoppingActions.FOCUS_NEXT:
            case ShoppingActions.FOCUS_PREVIOUS: {
                // eslint-disable-next-line no-console
                console.warn("Do relative focus things!", action);
                return state;
            }

            case ShoppingActions.TOGGLE_EXPANDED: {
                return {
                    ...state,
                    expandedIds: toggleDistinct(state.expandedIds, action.id),
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
        const s = this.getState();
        // todo: make this not suck
        return {
            id: s.activeId,
        };
    }

    isIngredientExpanded(id) {
        return this.getState().expandedIds.indexOf(id) >= 0;
    }

}

ShoppingStore.stateTypes = {
    selectedPlanIds: PropTypes.arrayOf(clientOrDatabaseIdType).isRequired,
    activeId: PropTypes.number,
    expandedIds: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default typedStore(new ShoppingStore(Dispatcher));
