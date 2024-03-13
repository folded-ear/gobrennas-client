import React from "react";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import { isExpanded } from "features/Planner/data/plannerUtils";
import planStore from "features/Planner/data/planStore";
import useFluxStore from "data/useFluxStore";
import Plan from "features/Planner/components/Plan";
import LoadObject from "../../util/LoadObject";
import { ripLoadObject, RippedLO } from "util/ripLoadObject";
import { RouteComponentProps } from "react-router";
import { useLoadedPlan } from "../RecipeDisplay/hooks/useLoadedPlan";
import useAllPlansRLO from "../../data/useAllPlansRLO";

export interface ItemTuple extends RippedLO<any> {
    ancestorDeleting: boolean;
    depth: number;
}

function listTheTree(id, ancestorDeleting = false, depth = 0): ItemTuple[] {
    const list = planStore.getChildItemLOs(id).map((lo: LoadObject<any>) => ({
        ...ripLoadObject(lo),
        ancestorDeleting,
        depth,
    }));
    for (let i = list.length - 1; i >= 0; i--) {
        if (!list[i].data) continue;
        const t = list[i].data;
        if (t.ingredientId) {
            const ing = ripLoadObject(
                LibraryStore.getIngredientById(t.ingredientId),
            ).data;
            if (ing) {
                list[i].data = {
                    ...list[i].data,
                    ingredient: ing,
                    fromRecipe: ing.type === "Recipe",
                };
            }
        }
        if (!isExpanded(t)) continue;
        list.splice(
            i + 1,
            0,
            ...listTheTree(
                t.id,
                ancestorDeleting || list[i].deleting,
                depth + 1,
            ),
        );
    }
    return list;
}

type Props = RouteComponentProps<{
    pid?: string;
}>;

export const PlannerController: React.FC<Props> = ({ match }) => {
    useLoadedPlan(match.params.pid);
    const allPlans = useAllPlansRLO();
    const state = useFluxStore(() => {
        const activePlan = ripLoadObject(planStore.getActivePlanLO());
        const activeItem = planStore.getActiveItem();
        const selectedItems = planStore.getSelectedItems();
        return {
            activePlan,
            planDetailVisible: planStore.isPlanDetailVisible(),
            itemTuples: activePlan.data ? listTheTree(activePlan.data.id) : [],
            isItemActive: activeItem
                ? (itemOrId) => (itemOrId.id || itemOrId) === activeItem.id
                : () => false,
            isItemSelected: selectedItems
                ? (itemOrId) =>
                      selectedItems.some(
                          (t) => (itemOrId.id || itemOrId) === t.id,
                      )
                : () => false,
        };
    }, [planStore, LibraryStore]);
    return <Plan allPlans={allPlans} {...state} />;
};
