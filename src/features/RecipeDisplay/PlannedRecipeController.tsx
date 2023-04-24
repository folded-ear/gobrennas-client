import useFluxStore from "data/useFluxStore";
import TaskStore from "features/Planner/data/TaskStore";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import React from "react";
import LoadObject from "util/LoadObject";
import LoadingIndicator from "views/common/LoadingIndicator";
import RecipeDetail from "./components/RecipeDetail";
import { RouteComponentProps } from "react-router";
import { Recipe as RecipeType } from "features/RecipeDisplay/types";
import { useLoadedPlan } from "./hooks/useLoadedPlan";

export interface RecipeFromTask extends RecipeType {
    subtaskIds: number[]
    subrecipes: RecipeType[]
}

export function buildFullRecipeLO(itemLO: LoadObject<any>): LoadObject<RecipeFromTask> {
    let lo = itemLO;
    if (!lo.hasValue()) return lo;

    const subs: any[] = [];
    let loading = false;
    const computeKids = item => {
        const subIds = item.subtaskIds || [];
        const subIdLookup = new Set(subIds);
        return subIds
            .concat((item.componentIds || [])
                .filter(id => !subIdLookup.has(id)))
            .map(id => TaskStore.getTaskLO(id))
            .filter(lo => {
                if (!lo.hasValue()) {
                    loading = true;
                    return false;
                }
                return true;
            })
            .map(lo => lo.getValueEnforcing());
    };
    const prepRecipe = (item, rLO?: LoadObject<any>) => {
        item = {
            ...item,
            ingredients: computeKids(item).map(ref => {
                ref = {
                    ...ref,
                    raw: ref.name,
                };
                let recurse = ref.subtaskIds && ref.subtaskIds.length;
                let iLO;
                if (ref.ingredientId) {
                    iLO = LibraryStore.getIngredientById(ref.ingredientId);
                    if (iLO.isLoading()) {
                        loading = true;
                    }
                    if (iLO.hasValue()) {
                        const ing = iLO.getValueEnforcing();
                        ref.ingredient = ing;
                        recurse = recurse || ing.type === "Recipe";
                    }
                }
                if (recurse) subs.push(prepRecipe(ref, iLO));
                return ref;
            }),
        };
        if (item.notes) {
            // replace the recipe's directions
            item.directions = item.notes;
        }
        if (!item.ingredientId) return item;
        rLO = rLO || LibraryStore.getIngredientById(item.ingredientId) as LoadObject<any>;
        if (rLO.isLoading()) {
            loading = true;
        }
        if (!rLO.hasValue()) return item;
        const r = rLO.getValueEnforcing();
        Object.keys(r)
            .filter(k => !item.hasOwnProperty(k))
            .forEach(k => item[k] = r[k]);
        return item;
    };
    const recipe = prepRecipe(lo.getValueEnforcing());
    recipe.subrecipes = subs;
    lo = LoadObject.withValue(recipe);
    if (loading) {
        lo = lo.loading();
    }
    return lo;
}

type Props = RouteComponentProps<{
    pid: string
    rid: string
}>;

const PlannedRecipeController: React.FC<Props> = ({ match }) => {
    const rid = parseInt(match.params.rid, 10);
    const lo = useFluxStore(
        () => buildFullRecipeLO(TaskStore.getTaskLO(rid)),
        [
            TaskStore,
            LibraryStore,
        ],
        [ rid ],
    );

    const pid = parseInt(match.params.pid, 10);
    useLoadedPlan(pid);

    if (lo.hasValue()) {
        return <RecipeDetail
            recipeLO={lo}
            subrecipes={lo.getValueEnforcing().subrecipes}
            ownerLO={LoadObject.empty()}
        />;
    }

    return <LoadingIndicator />;
};

export default PlannedRecipeController;
