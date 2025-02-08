import { AlertColor, Button } from "@mui/material";
import PlanItemStatus, {
    willStatusDelete,
} from "@/features/Planner/data/PlanItemStatus";
import planStore, { PlanItem } from "@/features/Planner/data/planStore";
import LibraryStore from "@/features/RecipeLibrary/data/LibraryStore";
import { ReduceStore } from "flux/utils";
import PropTypes from "prop-types";
import typedStore from "@/util/typedStore";
import dispatcher, { FluxAction } from "./dispatcher";
import { Maybe } from "graphql/jsutils/Maybe";
import * as React from "react";
import { SnackbarCloseReason } from "@mui/material/Snackbar/Snackbar";
import { BfsId } from "@/global/types/identity";

export interface Snack {
    key: number | string; // not a BfsId!
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
            key: (Date.now() % 100000) + Math.random(),
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
                            type: "plan/bulk-set-status",
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
            case "ui/show-fab": {
                return {
                    ...state,
                    fabVisible: true,
                };
            }

            case "ui/hide-fab": {
                return {
                    ...state,
                    fabVisible: false,
                };
            }

            case "ui/dismiss-snackbar": {
                return {
                    ...state,
                    queue: state.queue.slice(1),
                };
            }

            case "plan/send-to-plan":
            case "pantry-item/send-to-plan": {
                const plan = planStore.getPlanRlo(action.planId).data!;
                return enqueue(state, {
                    message: `Added ${action.name} to ${plan.name}`,
                    severity: "success",
                });
            }

            case "recipe/sent-to-plan": {
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

            case "recipe/error-sending-to-plan": {
                const plan = planStore.getPlanRlo(action.planId).data!;
                const recipe = LibraryStore.getIngredientById(
                    action.recipeId,
                ).getValueEnforcing();
                return enqueue(state, {
                    message: `Failed to send ${recipe.name} to ${plan.name}`,
                    severity: "error",
                });
            }

            case "plan/set-status": {
                return forPlanItemStatusChanges(
                    state,
                    [action.id],
                    action.status,
                );
            }

            case "plan/bulk-set-status": {
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

SnackBarStore["stateTypes"] = {
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
