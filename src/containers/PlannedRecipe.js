import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../data/dispatcher";
import LibraryStore from "../data/LibraryStore";
import TaskActions from "../data/TaskActions";
import TaskStore from "../data/TaskStore";
import useFluxStore from "../data/useFluxStore";
import LoadObject from "../util/LoadObject";
import LoadingIndicator from "../views/common/LoadingIndicator";
import RecipeDetail from "../views/cook/RecipeDetail";

export const buildFullRecipeLO = itemLO => {
    let lo = itemLO;
    if (!lo.hasValue()) return lo;

    const subs = [];
    let loading = false;
    const computeKids = item => {
        let subIds = item.subtaskIds || [];
        const subIdLookup = new Set(subIds);
        return (item.componentIds || [])
            .filter(id => !subIdLookup.has(id))
            .concat(subIds)
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
    const prepRecipe = (item, rLO) => {
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
        if (!item.ingredientId) return item;
        rLO = rLO || LibraryStore.getIngredientById(item.ingredientId);
        if (rLO.isLoading()) {
            loading = true;
        }
        if (!rLO.hasValue()) return item;
        const r = rLO.getValueEnforcing();
        item.name = r.name;
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
};

export const useLoadedPlan = pid => {
    // ensure it's loaded
    const allPlansLO = useFluxStore(
        () => TaskStore.getListsLO(),
        [
            TaskStore,
            LibraryStore,
        ],
    );
    // ensure it's selected
    React.useEffect(
        () => {
            if (allPlansLO.hasValue()) {
                Dispatcher.dispatch({
                    type: TaskActions.SELECT_LIST,
                    id: pid,
                });
            }
        },
        [allPlansLO, pid]
    );
};

const PlannedRecipe = ({match}) => {
    const rid = parseInt(match.params.rid, 10);
    const lo = useFluxStore(
        () => buildFullRecipeLO(TaskStore.getTaskLO(rid)),
        [
            TaskStore,
            LibraryStore,
        ],
        [rid],
    );

    const pid = parseInt(match.params.pid, 10);
    useLoadedPlan(pid);

    if (lo.hasValue()) {
        return <RecipeDetail
            anonymous
            recipeLO={lo}
            subrecipes={lo.getValueEnforcing().subrecipes}
            ownerLO={LoadObject.empty()}
        />;
    }

    return <LoadingIndicator />;
};

PlannedRecipe.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            pid: PropTypes.string.isRequired,
            rid: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired
};

export default PlannedRecipe;
