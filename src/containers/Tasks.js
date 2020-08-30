import { Container } from "flux/utils";
import React from "react";
import { isExpanded } from "../data/tasks";
import TaskStore from "../data/TaskStore";
import TaskList from "../views/TaskList";

const listTheTree = (id, deadChild, depth=0) => {
    const list = TaskStore.getSubtaskLOs(id).map(lo => ({
        lo,
        deadChild,
        depth
    }));
    for (let i = list.length - 1; i >= 0; i--) {
        const lo = list[i].lo;
        if (!lo.hasValue()) continue;
        const t = lo.getValueEnforcing();
        if (!isExpanded(t)) continue;
        list.splice(i + 1, 0, ...listTheTree(
            t.id,
            deadChild || lo.isDeleting(),
            depth + 1));
    }
    return list;
};

export default Container.createFunctional(
    props => <TaskList {...props} />,
    () => [
        TaskStore,
    ],
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
    }
);
