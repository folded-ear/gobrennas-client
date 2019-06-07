import React from "react";
import { Container } from 'flux/utils';
import TaskList from "../views/TaskList";
import TaskStore from "../data/TaskStore";

export default Container.createFunctional(
    props => <TaskList {...props} />,
    () => [
        TaskStore,
    ],
    (prevState, props) => ({
        name: TaskStore.getState(),
    })
);