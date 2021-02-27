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

export const buildFullRecipeLO = id => {
    let lo = TaskStore.getTaskLO(id);
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
    const prepRecipe = item => {
        item = {
            ...item,
            ingredients: computeKids(item).map(ref => {
                ref = {
                    ...ref,
                    raw: ref.name,
                };
                let recurse = ref.subtaskIds && ref.subtaskIds.length;
                if (ref.ingredientId) {
                    const iLO = LibraryStore.getIngredientById(ref.ingredientId);
                    if (iLO.isLoading()) {
                        loading = true;
                    }
                    if (!iLO.hasValue()) return ref;
                    const ing = iLO.getValueEnforcing();
                    ref.ingredient = ing;
                    recurse = recurse || ing.type === "Recipe";
                }
                if (recurse) subs.push(prepRecipe(ref));
                return ref;
            }),
        };
        if (!item.ingredientId) return item;
        const rLO = LibraryStore.getIngredientById(item.ingredientId);
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
};

const PlannedRecipe = ({match}) => {
    const pid = parseInt(match.params.pid, 10);
    const rid = parseInt(match.params.rid, 10);
    const state = useFluxStore(
        () => {
            const allPlansLO = TaskStore.getListsLO();
            const lo = buildFullRecipeLO(rid);
            return {
                allPlansLO,
                itemLO: lo,
            };
        },
        [
            TaskStore,
            LibraryStore,
        ],
        [rid],
    );
    // ensure the context plan is selected
    React.useEffect(
        () => {
            if (state.allPlansLO.hasValue()) {
                Dispatcher.dispatch({
                    type: TaskActions.SELECT_LIST,
                    id: pid,
                });
            }
        },
        [state.allPlansLO, pid]
    );

    const lo = state.itemLO;
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
