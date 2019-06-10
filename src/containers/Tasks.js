import React from "react";
import { Container } from "flux/utils";
import TaskList from "../views/TaskList";
import TaskStore from "../data/TaskStore";

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
            taskLOs: activeListLO.hasValue()
                ? TaskStore.getSubtaskLOs(activeListLO.getValueEnforcing().id)
                : null,
            isTaskActive: activeTask == null
                ? () => false
                : taskOrId => (taskOrId.id || taskOrId) === activeTask.id,
            isTaskSelected: selectedTasks == null
                ? () => false
                : taskOrId => selectedTasks.some(t => (taskOrId.id || taskOrId) === t.id),
        };
    }
);
