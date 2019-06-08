import React from "react";
import PropTypes from "prop-types";
import TaskListHeader from "./TaskListHeader";
import Task from "./Task";

class TaskList extends React.PureComponent {

    render() {
        const {
            allLists,
            activeList,
            topLevelTasks,
            isTaskActive,
            isTaskSelected,
        } = this.props;
        return <React.Fragment>
            <TaskListHeader allLists={allLists}
                            activeList={activeList}
            />
            {activeList && topLevelTasks.map(t =>
                <Task key={t.id}
                      task={t}
                      active={isTaskActive(t)}
                      selected={isTaskSelected(t)}
                />)}
        </React.Fragment>;
    }

}

TaskList.propTypes = {
    allLists: PropTypes.array.isRequired,
    activeList: PropTypes.object,
    topLevelTasks: PropTypes.array,
    isTaskActive: PropTypes.func.isRequired,
    isTaskSelected: PropTypes.func.isRequired,
};

export default TaskList;
