import List from "@material-ui/core/List";
import PropTypes from "prop-types";
import React from "react";
import LoadObject from "../../util/LoadObject";
import LoadingIndicator from "../common/LoadingIndicator";
import TaskListHeader from "../TaskListHeader";
import LoadingTask from "./LoadingTask";
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
            return <LoadingIndicator
                primary="Loading task lists..."
            />;
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
                    if (lo.hasValue()) {
                        const t = lo.getValueEnforcing();
                        return <Task
                            key={t.id}
                            depth={depth}
                            task={t}
                            ancestorDeleting={ancestorDeleting}
                            loadObject={lo}
                            active={isTaskActive(t)}
                            selected={isTaskSelected(t)}
                        />;
                    } else {
                        return <LoadingTask
                            key={lo.id}
                            depth={depth}
                        />;
                    }
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
