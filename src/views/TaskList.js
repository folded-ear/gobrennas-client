import React from "react";
import PropTypes from "prop-types";
import TaskListHeader from "./TaskListHeader";
import Task from "./Task";
import LoadObjectValve from "./LoadObjectValve";
import LoadObject from "../util/LoadObject";

class TaskList extends React.PureComponent {

    render() {
        const {
            allLists,
            activeList,
            taskLOs,
            isTaskActive,
            isTaskSelected,
        } = this.props;
        const renderBody = () => <React.Fragment>
            <TaskListHeader
                allLists={allLists.getValueEnforcing()}
                activeList={activeList}
            />
            {activeList && taskLOs.map(lo => {
                if (lo.hasValue()) {
                    const t = lo.getValueEnforcing();
                    return <Task key={t.id}
                                 task={t}
                                 loadObject={lo}
                                 active={isTaskActive(t)}
                                 selected={isTaskSelected(t)}
                    />;
                } else {
                    return <div key={lo.id}>
                        Loading...
                    </div>;
                }
            })}
        </React.Fragment>;
        return <LoadObjectValve loadObject={allLists}
                                loadingMessage="Loading Task Lists..."
                                renderBody={renderBody}
        />;
    }

}

TaskList.propTypes = {
    allLists: PropTypes.instanceOf(LoadObject).isRequired,
    activeList: PropTypes.object,
    taskLOs: PropTypes.arrayOf(
        PropTypes.instanceOf(LoadObject)),
    isTaskActive: PropTypes.func.isRequired,
    isTaskSelected: PropTypes.func.isRequired,
};

export default TaskList;
