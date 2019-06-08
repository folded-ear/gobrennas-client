import React from "react";
import { Container } from 'flux/utils';
import TaskList from "../views/TaskList";
import TaskStore from "../data/TaskStore";

export default Container.createFunctional(
    props => <TaskList {...props} />,
    () => [
        TaskStore,
    ],
    () => {
        const allLists = TaskStore.getLists()
            .sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return +1;
                return 0;
            });
        const activeList = TaskStore.getActiveList();
        const activeTask = TaskStore.getActiveTask();
        const selectedTasks = TaskStore.getSelectedTasks();
        return {
            allLists,
            activeList,
            topLevelTasks: activeList
                ? TaskStore.getChildTasks(activeList.id)
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
