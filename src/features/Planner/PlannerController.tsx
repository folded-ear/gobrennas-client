import { useGetAllPlans } from "@/data/hooks/useGetAllPlans";
import useFluxStore from "@/data/useFluxStore";
import Plan from "@/features/Planner/components/Plan";
import { isExpanded } from "@/features/Planner/data/plannerUtils";
import planStore from "@/features/Planner/data/planStore";
import LibraryStore from "@/features/RecipeLibrary/data/LibraryStore";
import { BfsId, Identified } from "@/global/types/identity";
import { Ingredient } from "@/global/types/types";
import { RippedLO } from "@/util/ripLoadObject";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { useLoadedPlan } from "../RecipeDisplay/hooks/useLoadedPlan";
import { PlanItem } from "./data/planStore";

export interface ItemData extends PlanItem {
    ingredient?: Ingredient;
    fromRecipe?: boolean;
}

export interface ItemTuple extends RippedLO<ItemData> {
    ancestorDeleting: boolean;
    depth: number;
}

function listTheTree(
    id: BfsId,
    ancestorDeleting = false,
    depth = 0,
): ItemTuple[] {
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
    const { data: allPlans, loading: allLoading } = useGetAllPlans();
    const { activeLoading, ...state } = useFluxStore(() => {
        const activePlan = planStore.getActivePlanRlo();
        const activeItem = planStore.getActiveItem();
        const selectedItems = planStore.getSelectedItems();
        return {
            activePlan,
            activeLoading: activePlan.loading,
            planDetailVisible: planStore.isPlanDetailVisible(),
            itemTuples: activePlan.data ? listTheTree(activePlan.data.id) : [],
            isItemActive: activeItem
                ? (it: Identified) => it.id === activeItem.id
                : () => false,
            isItemSelected: selectedItems
                ? (it: Identified) => selectedItems.some((t) => it.id === t.id)
                : () => false,
        };
    }, [planStore, LibraryStore]);
    return (
        <Plan
            loading={activeLoading || allLoading}
            allPlans={allPlans}
            {...state}
        />
    );
};
