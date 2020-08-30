import {
    List,
    Spin,
} from "antd";
import PropTypes from "prop-types";
import React from "react";
import LoadObject from "../util/LoadObject";
import LoadingTask from "./LoadingTask";
import Task from "./Task";
import TaskListHeader from "./TaskListHeader";

class TaskList extends React.PureComponent {

    render() {
        const {
            allLists,
            activeListLO,
            listDetailVisible,
            taskTuples,
            isTaskActive,
            isTaskSelected,
        } = this.props;
        if (!allLists.hasValue()) {
            return <Spin tip="Loading task lists..." />;
        }
        return <List
            size="small"
            bordered={false}
            split={false}
            className="task-list"
            header={<TaskListHeader
                allLists={allLists.getValueEnforcing()}
                activeList={activeListLO.getValue()}
                listDetailVisible={listDetailVisible}
            />}
            dataSource={taskTuples}
            renderItem={item => {
                const {
                    lo,
                    depth,
                    deadChild,
                } = item;
                let body;
                if (lo.hasValue()) {
                    const t = lo.getValueEnforcing();
                    body = <Task
                        key={t.id}
                        task={t}
                        deadChild={deadChild}
                        loadObject={lo}
                        active={isTaskActive(t)}
                        selected={isTaskSelected(t)}
                    />;
                } else {
                    body = <LoadingTask key={lo.id} />;
                }
                return <List.Item
                    className="task"
                    style={{
                        marginLeft: depth * 2 + "em",
                    }}
                >
                    {body}
                </List.Item>;
            }}
        />;
    }

}

TaskList.propTypes = {
    allLists: PropTypes.instanceOf(LoadObject).isRequired,
    activeListLO: PropTypes.instanceOf(LoadObject),
    listDetailVisible: PropTypes.bool.isRequired,
    taskTuples: PropTypes.arrayOf(
        PropTypes.shape({
            lo: PropTypes.instanceOf(LoadObject).isRequired,
            depth: PropTypes.number.isRequired,
            deadChild: PropTypes.bool,
        })),
    isTaskActive: PropTypes.func.isRequired,
    isTaskSelected: PropTypes.func.isRequired,
};

export default TaskList;
