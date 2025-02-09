import { AlertColor, Button } from "@mui/material";
import PlanItemStatus, {
    willStatusDelete,
} from "@/features/Planner/data/PlanItemStatus";
import planStore, { PlanItem } from "@/features/Planner/data/planStore";
import LibraryStore from "@/features/RecipeLibrary/data/LibraryStore";
import { ReduceStore } from "flux/utils";
import dispatcher, { ActionType, FluxAction } from "./dispatcher";
import { Maybe } from "graphql/jsutils/Maybe";
import * as React from "react";
import { SnackbarCloseReason } from "@mui/material/Snackbar/Snackbar";
import { BfsId } from "@/global/types/identity";

export interface Snack {
    // Think `React.Key`, but not _only_ for React to use.
    key: string;
    message: string;
    severity?: AlertColor;
    renderAction?: Maybe<
        (dismiss: (e: React.SyntheticEvent | Event) => void) => React.ReactNode
    >;
    onClose?: (
        event?: React.SyntheticEvent | Event,
        reason?: SnackbarCloseReason,
    ) => void;
    hideDelay?: Maybe<number>;
}

interface State {
    fabVisible: boolean;
    queue: Snack[];
}

const enqueue = (state: State, item: Omit<Snack, "key">): State => {
    return {
        ...state,
        queue: state.queue.concat({
            ...item,
            key: "" + (Date.now() % 100000) + Math.random(),
        }),
    };
};

function forPlanItemStatusChanges(
    state: State,
    ids: BfsId[],
    status: PlanItemStatus,
): State {
    if (!ids || ids.length === 0) return state;
    if (!willStatusDelete(status)) return state;
    const comps = ids.reduce(
        (arr, id) => arr.concat(planStore.getNonDescendantComponents(id)),
        [] as PlanItem[],
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
                            type: ActionType.PLAN__BULK_SET_STATUS,
                            status,
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
}

class SnackBarStore extends ReduceStore<State, FluxAction> {
    getInitialState(): State {
        return {
            fabVisible: false,
            queue: [],
        };
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case ActionType.UI__SHOW_FAB: {
                return {
                    ...state,
                    fabVisible: true,
                };
            }

            case ActionType.UI__HIDE_FAB: {
                return {
                    ...state,
                    fabVisible: false,
                };
            }

            case ActionType.UI__DISMISS_SNACKBAR: {
                return {
                    ...state,
                    queue: state.queue.slice(1),
                };
            }

            case ActionType.PLAN__SEND_TO_PLAN:
            case ActionType.PANTRY_ITEM__SEND_TO_PLAN: {
                const plan = planStore.getPlanRlo(action.planId).data!;
                return enqueue(state, {
                    message: `Added ${action.name} to ${plan.name}`,
                    severity: "success",
                });
            }

            case ActionType.RECIPE__SENT_TO_PLAN: {
                const plan = planStore.getPlanRlo(action.planId).data!;
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

            case ActionType.RECIPE__ERROR_SENDING_TO_PLAN: {
                const plan = planStore.getPlanRlo(action.planId).data!;
                const recipe = LibraryStore.getIngredientById(
                    action.recipeId,
                ).getValueEnforcing();
                return enqueue(state, {
                    message: `Failed to send ${recipe.name} to ${plan.name}`,
                    severity: "error",
                });
            }

            case ActionType.PLAN__SET_STATUS: {
                return forPlanItemStatusChanges(
                    state,
                    [action.id],
                    action.status,
                );
            }

            case ActionType.PLAN__BULK_SET_STATUS: {
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

export default new SnackBarStore(dispatcher);
