import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { Spin } from "antd";
import PropTypes from "prop-types";
import React from "react";
import LoadObject from "../../util/LoadObject";
import LoadingTask from "./../LoadingTask";
import TaskListHeader from "./../TaskListHeader";
import Task from "./Task";

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
        return <>
            <TaskListHeader
                allLists={allLists.getValueEnforcing()}
                activeList={activeListLO.getValue()}
                listDetailVisible={listDetailVisible}
            />
            <List>
                {taskTuples.map(item => {
                    const {
                        lo,
                        depth,
                        ancestorDeleting,
                    } = item;
                    let key, body;
                    if (lo.hasValue()) {
                        const t = lo.getValueEnforcing();
                        key = t.id;
                        body = <Task
                            task={t}
                            ancestorDeleting={ancestorDeleting}
                            loadObject={lo}
                            active={isTaskActive(t)}
                            selected={isTaskSelected(t)}
                        />;
                    } else {
                        key = lo.id;
                        body = <LoadingTask />;
                    }
                    return <ListItem
                        key={key}
                        className="task"
                        style={{
                            marginLeft: depth * 2 + "em",
                        }}
                    >
                        {body}
                    </ListItem>;
                })}
            </List>
        </>;
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
            ancestorDeleting: PropTypes.bool,
        })),
    isTaskActive: PropTypes.func.isRequired,
    isTaskSelected: PropTypes.func.isRequired,
};

export default TaskList;
