import React from "react";
import { Container } from 'flux/utils';
import TaskList from "../views/TaskList";
import TaskStore from "../data/TaskStore";
import Dispatcher from "../data/dispatcher";
import TaskActions from "../data/TaskActions";

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
            isTaskActive: taskOrId =>
                (taskOrId.id || taskOrId) === activeTask.id,
            onCreate: name => Dispatcher.dispatch({
                type: TaskActions.CREATE_LIST,
                name,
            }),
            onSelect: id => Dispatcher.dispatch({
                type: TaskActions.SELECT_LIST,
                id,
            }),
            onRename: (id, name) => Dispatcher.dispatch({
                type: TaskActions.RENAME,
                id,
                name,
            }),
            onFocus: id => Dispatcher.dispatch({
                type: TaskActions.FOCUS,
                id,
            }),
        };
    }
);