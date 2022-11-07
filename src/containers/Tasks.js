import React from "react";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import { isExpanded } from "../data/tasks";
import TaskStore from "../data/TaskStore";
import useFluxStore from "../data/useFluxStore";
import TaskList from "../views/plan/TaskList";

const listTheTree = (id, ancestorDeleting=false, depth=0) => {
    const list = TaskStore.getSubtaskLOs(id).map(lo => ({
        lo,
        ancestorDeleting,
        depth
    }));
    for (let i = list.length - 1; i >= 0; i--) {
        let lo = list[i].lo;
        if (!lo.hasValue()) continue;
        const t = lo.getValueEnforcing();
        if (t.ingredientId) {
            const iLO = LibraryStore.getIngredientById(t.ingredientId);
            if (iLO.hasValue()) {
                const ing = iLO.getValueEnforcing();
                list[i].lo = lo = lo.map(t => ({
                    ...t,
                    ingredient: ing,
                    fromRecipe: ing.type === "Recipe",
                }));
            }
        }
        if (!isExpanded(t)) continue;
        list.splice(i + 1, 0, ...listTheTree(
            t.id,
            ancestorDeleting || lo.isDeleting(),
            depth + 1));
    }
    return list;
};

const Tasks = () => {
    const state = useFluxStore(
        () => {
            const allLists = TaskStore.getLists();
            const activeListLO = TaskStore.getActiveListLO();
            const activeTask = TaskStore.getActiveTask();
            const selectedTasks = TaskStore.getSelectedTasks();
            return {
                allLists,
                activeListLO,
                listDetailVisible: TaskStore.isListDetailVisible(),
                taskTuples: activeListLO.hasValue()
                    ? listTheTree(activeListLO.getValueEnforcing().id)
                    : [],
                isTaskActive: activeTask == null
                    ? () => false
                    : taskOrId => (taskOrId.id || taskOrId) === activeTask.id,
                isTaskSelected: selectedTasks == null
                    ? () => false
                    : taskOrId => selectedTasks.some(t => (taskOrId.id || taskOrId) === t.id),
            };
        },
        [
            TaskStore,
            LibraryStore,
        ],
    );
    return <TaskList {...state} />;
};

export default Tasks;
