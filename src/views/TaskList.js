import React from "react";
import PropTypes from "prop-types";
import TaskListHeader from "./TaskListHeader";

class TaskList extends React.PureComponent {

    render() {
        const {
            lists,
            activeListId,
            onCreate,
            onSelect,
        } = this.props;
        return <div>
            <TaskListHeader lists={lists}
                            activeListId={activeListId}
                            onCreate={onCreate}
                            onSelect={onSelect}
            />
            {activeListId && <h2>
                hello {activeListId}
            </h2>}
        </div>;
    }

}

TaskList.propTypes = {
    lists: PropTypes.array.isRequired,
    activeListId: PropTypes.oneOfType([
        // kludge for a db id or a client id
        PropTypes.number,
        PropTypes.string,
    ]),
    onCreate: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default TaskList;