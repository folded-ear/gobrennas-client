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
            isTaskActive
        } = this.props;
        return <div>
            <TaskListHeader allLists={allLists}
                            activeList={activeList}
            />
            {activeList && <h2>
                hello {activeList.name}
                {topLevelTasks.map(t =>
                    <Task key={t.id}
                          task={t}
                          active={isTaskActive(t)}
                    />)}
            </h2>}
        </div>;
    }

}

TaskList.propTypes = {
    allLists: PropTypes.array.isRequired,
    activeList: PropTypes.object,
    topLevelTasks: PropTypes.array,
    isTaskActive: PropTypes.func.isRequired,
};

export default TaskList;