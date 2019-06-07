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
    () => ({
        activeListId: TaskStore.getActiveListId(),
        lists: TaskStore.getTopLevelTasks(),
        onCreate: name => Dispatcher.dispatch({
            type: TaskActions.CREATE_LIST,
            name,
        }),
        onSelect: id => Dispatcher.dispatch({
            type: TaskActions.SELECT_LIST,
            id,
        }),
    })
);