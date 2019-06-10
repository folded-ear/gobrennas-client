import React from "react";
import PropTypes from "prop-types";
import TaskListHeader from "./TaskListHeader";
import Task from "./Task";
import LoadObject from "../util/LoadObject";
import { Spin } from "antd";
import LoadingTask from "./LoadingTask";

class TaskList extends React.PureComponent {

    render() {
        const {
            allLists,
            activeListLO,
            taskLOs,
            isTaskActive,
            isTaskSelected,
        } = this.props;
        if (!allLists.hasValue() || !activeListLO.hasValue()) {
            return <Spin tip="Loading task lists..." />
        }
        const activeList = activeListLO.getValueEnforcing();
        return <React.Fragment>
            <TaskListHeader
                allLists={allLists.getValueEnforcing()}
                activeList={activeList}
            />
            {activeListLO.isDone() && activeListLO.hasValue()
                ? taskLOs.map(lo => {
                    if (lo.hasValue()) {
                        const t = lo.getValueEnforcing();
                        return <Task key={t.id}
                                     task={t}
                                     loadObject={lo}
                                     active={isTaskActive(t)}
                                     selected={isTaskSelected(t)}
                        />;
                    } else {
                        return <LoadingTask key={lo.id} />;
                    }
                })
                : <Spin tip={`Loading tasks for '${activeList.name}'...`} />}
        </React.Fragment>;
    }

}

TaskList.propTypes = {
    allLists: PropTypes.instanceOf(LoadObject).isRequired,
    activeListLO: PropTypes.instanceOf(LoadObject),
    taskLOs: PropTypes.arrayOf(
        PropTypes.instanceOf(LoadObject)),
    isTaskActive: PropTypes.func.isRequired,
    isTaskSelected: PropTypes.func.isRequired,
};

export default TaskList;
