import React from "react";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import { isExpanded } from "features/Planner/data/plannerUtils";
import planStore from "features/Planner/data/planStore";
import useFluxStore from "data/useFluxStore";
import Plan from "features/Planner/components/Plan";
import { RippedLO } from "util/ripLoadObject";
import { RouteComponentProps } from "react-router";
import { useLoadedPlan } from "../RecipeDisplay/hooks/useLoadedPlan";
import useAllPlansRLO from "../../data/useAllPlansRLO";
import { PlanItem } from "./data/planStore";
import { Ingredient } from "../../global/types/types";

interface ItemData extends PlanItem {
    ingredient?: Ingredient;
    fromRecipe?: boolean;
}

export interface ItemTuple extends RippedLO<ItemData> {
    ancestorDeleting: boolean;
    depth: number;
}

function listTheTree(id, ancestorDeleting = false, depth = 0): ItemTuple[] {
    const list: ItemTuple[] = planStore.getChildItemRlos(id).map((rlo) => ({
        ...rlo,
        ancestorDeleting,
        depth,
    }));
    for (let i = list.length - 1; i >= 0; i--) {
        const t = list[i].data;
        if (!t) continue;
        if (t.ingredientId) {
            const ing = LibraryStore.getIngredientRloById(t.ingredientId).data;
            if (ing) {
                list[i].data = {
                    ...t,
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
        const activePlan = planStore.getActivePlanRlo();
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
