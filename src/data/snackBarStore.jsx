import { Button } from "@mui/material";
import PlanActions from "@/features/Planner/data/PlanActions";
import PlanItemStatus, {
    willStatusDelete,
} from "@/features/Planner/data/PlanItemStatus";
import planStore from "@/features/Planner/data/planStore";
import LibraryStore from "@/features/RecipeLibrary/data/LibraryStore";
import { ReduceStore } from "flux/utils";
import PropTypes from "prop-types";
import React from "react";
import typedStore from "@/util/typedStore";
import dispatcher from "./dispatcher";
import PantryItemActions from "./PantryItemActions";
import RecipeActions from "./RecipeActions";
import UiActions from "./UiActions";

const enqueue = (state, item) => {
    return {
        ...state,
        queue: state.queue.concat({
            key: (Date.now() % 100000) + Math.random(),
            ...item,
        }),
    };
};

const forPlanItemStatusChanges = (state, ids, status) => {
    if (!ids || ids.length === 0) return state;
    if (!willStatusDelete(status)) return state;
    const comps = ids.reduce(
        (arr, id) => arr.concat(planStore.getNonDescendantComponents(id)),
        [],
    );
    if (comps.length === 0) return state;
    const label =
        ids.length === 1
            ? planStore.getItemLO(ids[0]).getValueEnforcing().name + " includes"
            : "These items include";
    return enqueue(state, {
        message: `${label} ${comps.map((c) => c.name).join(", ")}`,
        renderAction(dismiss) {
            return (
                <Button
                    color="neutral"
                    size="small"
                    onClick={(e) => {
                        dismiss(e);
                        dispatcher.dispatch({
                            type: PlanActions.BULK_SET_STATUS,
                            status: status,
                            ids: comps.map((c) => c.id),
                        });
                    }}
                >
                    {status === PlanItemStatus.COMPLETED
                        ? "I Cooked"
                        : "Delete"}{" "}
                    {comps.length === 1 ? "It" : "Them"}
                </Button>
            );
        },
    });
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

            case PlanActions.SEND_TO_PLAN:
            case PantryItemActions.SEND_TO_PLAN: {
                const plan = planStore
                    .getItemLO(action.planId)
                    .getValueEnforcing();
                return enqueue(state, {
                    message: `Added ${action.name} to ${plan.name}`,
                    severity: "success",
                });
            }

            case RecipeActions.SENT_TO_PLAN: {
                const plan = planStore
                    .getItemLO(action.planId)
                    .getValueEnforcing();
                // if came from the library, the store might not have it...
                const recipe = LibraryStore.getIngredientById(
                    action.recipeId,
                ).getValue();
                return enqueue(state, {
                    message: `Added ${recipe ? recipe.name : "recipe"} to ${
                        plan.name
                    }`,
                    severity: "success",
                });
            }

            case RecipeActions.ERROR_SENDING_TO_PLAN: {
                const plan = planStore
                    .getItemLO(action.planId)
                    .getValueEnforcing();
                const recipe = LibraryStore.getIngredientById(
                    action.recipeId,
                ).getValueEnforcing();
                return enqueue(state, {
                    message: `Failed to send ${recipe.name} to ${plan.name}`,
                    severity: "error",
                });
            }

            case PlanActions.SET_STATUS: {
                return forPlanItemStatusChanges(
                    state,
                    [action.id],
                    action.status,
                );
            }

            case PlanActions.BULK_SET_STATUS: {
                return forPlanItemStatusChanges(
                    state,
                    action.ids,
                    action.status,
                );
            }

            default:
                return state;
        }
    }
}

SnackBarStore.stateTypes = {
    fabVisible: PropTypes.bool.isRequired,
    queue: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.number.isRequired,
            message: PropTypes.string.isRequired,
            severity: PropTypes.string,
            renderAction: PropTypes.func,
            onClose: PropTypes.func,
            hideDelay: PropTypes.number,
        }),
    ).isRequired,
};

export default typedStore(new SnackBarStore(dispatcher));
