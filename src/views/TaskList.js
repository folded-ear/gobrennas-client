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
            listDetailVisible,
            taskLOs,
            isTaskActive,
            isTaskSelected,
        } = this.props;
        if (!allLists.hasValue()) {
            return <Spin tip="Loading task lists..." />
        }
        return <React.Fragment>
            <TaskListHeader
                allLists={allLists.getValueEnforcing()}
                activeList={activeListLO.getValue()}
                listDetailVisible={listDetailVisible}
            />
            {taskLOs != null && taskLOs.map(lo => {
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
            })}
        </React.Fragment>;
    }

}

TaskList.propTypes = {
    allLists: PropTypes.instanceOf(LoadObject).isRequired,
    activeListLO: PropTypes.instanceOf(LoadObject),
    listDetailVisible: PropTypes.bool.isRequired,
    taskLOs: PropTypes.arrayOf(
        PropTypes.instanceOf(LoadObject)),
    isTaskActive: PropTypes.func.isRequired,
    isTaskSelected: PropTypes.func.isRequired,
};

export default TaskList;
