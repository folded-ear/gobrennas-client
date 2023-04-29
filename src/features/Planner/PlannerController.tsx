import React from "react";
import LibraryStore from "features/RecipeLibrary/data/LibraryStore";
import { isExpanded } from "features/Planner/data/tasks";
import TaskStore from "features/Planner/data/TaskStore";
import useFluxStore from "data/useFluxStore";
import TaskList from "features/Planner/components/TaskList";
import LoadObject from "../../util/LoadObject";
import { ripLoadObject } from "../../util/ripLoadObject";

export interface TaskTuple {
    data: any,
    error: any,
    loading: boolean,
    deleting: boolean,
    ancestorDeleting: boolean
    depth: number
}

function listTheTree(id, ancestorDeleting = false, depth = 0): TaskTuple[] {
    const list = TaskStore.getSubtaskLOs(id).map((lo: LoadObject<any>) => ({
        ...ripLoadObject(lo),
        ancestorDeleting,
        depth,
    }));
    for (let i = list.length - 1; i >= 0; i--) {
        if (!list[i].data) continue;
        const t = list[i].data;
        if (t.ingredientId) {
            const ing = ripLoadObject(LibraryStore.getIngredientById(t.ingredientId)).data;
            if (ing) {
                list[i].data = {
                    ...list[i].data,
                    ingredient: ing,
                    fromRecipe: ing.type === "Recipe",
                };
            }
        }
        if (!isExpanded(t)) continue;
        list.splice(i + 1, 0, ...listTheTree(
            t.id,
            ancestorDeleting || list[i].deleting,
            depth + 1));
    }
    return list;
}

export const PlannerController = () => {
    const state = useFluxStore(
        () => {
            const allLists = ripLoadObject(TaskStore.getListsLO());
            const activeList = ripLoadObject(TaskStore.getActiveListLO());
            const activeTask = TaskStore.getActiveTask();
            const selectedTasks = TaskStore.getSelectedTasks();
            return {
                allLists,
                activeList,
                listDetailVisible: TaskStore.isListDetailVisible(),
                taskTuples: activeList.data
                    ? listTheTree(activeList.data.id)
                    : [],
                isTaskActive: activeTask
                    ? taskOrId => (taskOrId.id || taskOrId) === activeTask.id
                    : () => false,
                isTaskSelected: selectedTasks
                    ? taskOrId => selectedTasks.some(t => (taskOrId.id || taskOrId) === t.id)
                    : () => false,
            };
        },
        [
            TaskStore,
            LibraryStore,
        ],
    );
    return <TaskList {...state} />;
};
