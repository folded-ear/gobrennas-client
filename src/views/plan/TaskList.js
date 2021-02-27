import {
    Box,
    List,
} from "@material-ui/core";
import Add from "@material-ui/icons/Add";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import TaskActions from "../../data/TaskActions";
import LoadObject from "../../util/LoadObject";
import FoodingerFab from "../common/FoodingerFab";
import LoadingIndicator from "../common/LoadingIndicator";
import PageBody from "../common/PageBody";
import TaskListHeader from "../TaskListHeader";
import LoadingTask from "./LoadingTask";
import Task from "./Task";

class TaskList extends React.PureComponent {

    constructor(...args) {
        super(...args);
        this.onAddNew = this.onAddNew.bind(this);
    }

    onAddNew(e) {
        e.preventDefault();
        Dispatcher.dispatch({
            type: TaskActions.CREATE_TASK_AT_END,
        });
    }

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

        const plan = activeListLO.getValue();
        const buckets = plan && plan.buckets;
        return <PageBody hasFab>
            <Box p={2}>
                <TaskListHeader
                    allLists={allLists.getValueEnforcing()}
                    activeList={plan}
                    listDetailVisible={listDetailVisible}
                    hasBuckets={!!buckets}
                />
            </Box>
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
                            plan={plan}
                            depth={depth}
                            task={t}
                            ancestorDeleting={ancestorDeleting}
                            loadObject={lo}
                            active={isTaskActive(t)}
                            selected={isTaskSelected(t)}
                            buckets={buckets}
                        />;
                    } else {
                        return <LoadingTask
                            key={lo.id}
                            depth={depth}
                        />;
                    }
                })}
            </List>
            <FoodingerFab
                onClick={this.onAddNew}
            >
                <Add />
            </FoodingerFab>
        </PageBody>;
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
