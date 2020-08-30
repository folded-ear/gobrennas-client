import { Container } from "flux/utils";
import React from "react";
import { isExpanded } from "../data/tasks";
import TaskStore from "../data/TaskStore";
import TaskList from "../views/TaskList";

const listTheTree = (id, dead_child, depth=0) => {
    const list = TaskStore.getSubtaskLOs(id)
        .map(lo =>
            lo.map(v => ({
                ...v,
                dead_child,
                depth
            })));
    for (let i = list.length - 1; i >= 0; i--) {
        const lo = list[i];
        if (!lo.hasValue()) continue;
        const t = lo.getValueEnforcing();
        if (!isExpanded(t)) continue;
        list.splice(i + 1, 0, ...listTheTree(
            t.id,
            dead_child || lo.isDeleting(),
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
            taskLOs: activeListLO.hasValue()
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
