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
        const activeList = TaskStore.getActiveList();
        const activeTask = TaskStore.getActiveTask();
        return {
            allLists: TaskStore.getLists(),
            activeList,
            topLevelTasks: activeList
                ? TaskStore.getChildTasks(activeList.id)
                : null,
            isTaskActive: activeTask == null
                ? () => false
                : taskOrId => (taskOrId.id || taskOrId) === activeTask.id,
        };
    }
);