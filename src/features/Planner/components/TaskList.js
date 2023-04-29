import Add from "@mui/icons-material/Add";
import {
    Box,
    List,
} from "@mui/material";
import Dispatcher from "data/dispatcher";
import LoadingTask from "features/Planner/components/LoadingTask";
import Task from "features/Planner/components/Task";
import TaskListHeader from "features/Planner/components/TaskListHeader";
import TaskActions from "features/Planner/data/TaskActions";
import { isParent } from "features/Planner/data/tasks";
import PropTypes from "prop-types";
import React from "react";
import FoodingerFab from "views/common/FoodingerFab";
import LoadingIndicator from "views/common/LoadingIndicator";
import PageBody from "views/common/PageBody";
import { rippedLoadObjectOf } from "../../../util/loadObjectTypes";

function TaskList(props) {
    const {
        allLists,
        activeList,
        listDetailVisible,
        taskTuples,
        isTaskActive,
        isTaskSelected,
    } = props;

    if (!allLists.data) {
        return <LoadingIndicator
            primary="Loading task lists..."
        />;
    }

    const handleAddNew = e => {
        e.preventDefault();
        Dispatcher.dispatch({
            type: TaskActions.CREATE_TASK_AT_END,
        });
    };

    const plan = activeList.data;
    const buckets = plan && plan.buckets;
    const canExpand = taskTuples.some(t =>
        t.data && isParent(t.data));
    return <PageBody hasFab>
        <Box py={2}>
            <TaskListHeader
                allLists={allLists.data}
                activeList={plan}
                listDetailVisible={listDetailVisible}
                hasBuckets={!!buckets}
                canExpand={canExpand}
            />
        </Box>
        <List>
            {taskTuples.map((item, i) => {
                const {
                    data,
                    loading,
                    depth,
                    ancestorDeleting,
                } = item;
                if (data) {
                    return <Task
                        key={data.id}
                        plan={plan}
                        depth={depth}
                        task={data}
                        ancestorDeleting={ancestorDeleting}
                        loading={loading}
                        active={isTaskActive(data)}
                        selected={isTaskSelected(data)}
                        buckets={buckets}
                    />;
                } else {
                    return <LoadingTask
                        key={i}
                        depth={depth}
                    />;
                }
            })}
        </List>
        <FoodingerFab
            onClick={handleAddNew}
        >
            <Add />
        </FoodingerFab>
    </PageBody>;
}

TaskList.propTypes = {
    allLists: rippedLoadObjectOf(PropTypes.any).isRequired,
    activeList: rippedLoadObjectOf(PropTypes.any),
    listDetailVisible: PropTypes.bool.isRequired,
    taskTuples: PropTypes.arrayOf(
        PropTypes.shape({
            data: PropTypes.any,
            loading: PropTypes.bool.isRequired,
            depth: PropTypes.number.isRequired,
            ancestorDeleting: PropTypes.bool,
        })),
    isTaskActive: PropTypes.func.isRequired,
    isTaskSelected: PropTypes.func.isRequired,
};

export default TaskList;
