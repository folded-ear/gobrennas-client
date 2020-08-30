import {
    Button,
    Input,
} from "antd";
import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../data/dispatcher";
import TaskActions from "../data/TaskActions";
import {
    isQuestionable,
    isSection,
} from "../data/tasks";
import TaskStore from "../data/TaskStore";
import LoadObject from "../util/LoadObject";
import "./Task.scss";

class Task extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onUndoDelete = this.onUndoDelete.bind(this);
        this.inputRef = React.createRef();
    }

    onChange(e) {
        const { value } = e.target;
        const {
            task,
        } = this.props;
        Dispatcher.dispatch({
            type: TaskActions.RENAME_TASK,
            id: task.id,
            name: value,
        });
    }

    onCopy(e) {
        if (! TaskStore.isMultiTaskSelection()) return;
        e.preventDefault();
        const text = TaskStore.getSelectionAsTextBlock();
        e.clipboardData.setData("text", text);
    }

    onPaste(e) {
        let text = e.clipboardData.getData("text");
        if (text == null) return;
        text = text.trim();
        if (text.indexOf("\n") < 0) return;
        // it's multi-line!
        e.preventDefault();
        Dispatcher.dispatch({
            type: TaskActions.MULTI_LINE_PASTE,
            text,
        });
    }

    onKeyDown(e) {
        const {
            value,
            selectionStart,
        } = e.target;
        const {
            key,
            ctrlKey,
            shiftKey,
        } = e;
        switch (key) { // eslint-disable-line default-case
            case "Enter":
                if (value.length === 0) break;
                // add a new item, before if the cursor is at the beginning, after otherwise
                Dispatcher.dispatch({
                    type: selectionStart === 0
                        ? TaskActions.CREATE_TASK_BEFORE
                        : TaskActions.CREATE_TASK_AFTER,
                    id: this.props.task.id,
                });
                break;
            case "Backspace":
                // if the value is empty, delete the task and focus previous
                if (value.length === 0) {
                    e.preventDefault();
                    Dispatcher.dispatch({
                        type: TaskActions.DELETE_TASK_BACKWARDS,
                        id: this.props.task.id
                    });
                }
                break;
            case "Delete":
                // if the value is empty, delete the task and focus next
                if (value.length === 0 || shiftKey) {
                    e.preventDefault();
                    this.onDelete();
                }
                break;
            case "Tab":
                e.preventDefault();
                Dispatcher.dispatch({
                    type: shiftKey ? TaskActions.UNNEST : TaskActions.NEST,
                    id: this.props.task.id,
                });
                break;
            case "ArrowUp":
                e.preventDefault();
                if (shiftKey && ctrlKey) break;
                if (shiftKey) {
                    // select this task and the previous one
                    Dispatcher.dispatch({
                        type: TaskActions.SELECT_PREVIOUS,
                        id: this.props.task.id,
                    });
                } else if (ctrlKey) {
                    // move all selected tasks up one (if a predecessor exists)
                    Dispatcher.dispatch({
                        type: TaskActions.MOVE_PREVIOUS,
                    });
                } else {
                    Dispatcher.dispatch({
                        type: TaskActions.FOCUS_PREVIOUS,
                        id: this.props.task.id,
                    });
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                if (shiftKey && ctrlKey) break;
                if (shiftKey) {
                    // select this task and the next one
                    Dispatcher.dispatch({
                        type: TaskActions.SELECT_NEXT,
                        id: this.props.task.id,
                    });
                } else if (ctrlKey) {
                    // move all selected tasks down one (if a follower exists)
                    Dispatcher.dispatch({
                        type: TaskActions.MOVE_NEXT,
                    });
                } else {
                    Dispatcher.dispatch({
                        type: TaskActions.FOCUS_NEXT,
                        id: this.props.task.id,
                    });
                }
                break;
        }
    }

    onDelete() {
        Dispatcher.dispatch({
            type: TaskActions.DELETE_TASK_FORWARD,
            id: this.props.task.id,
        });
    }

    onUndoDelete() {
        Dispatcher.dispatch({
            type: TaskActions.TASK_UNDO_DELETE,
            id: this.props.task.id,
        });
    }

    onClick(e) {
        const {
            active,
            task,
        } = this.props;
        if (active) return;
        e.preventDefault();
        e.stopPropagation();
        Dispatcher.dispatch({
            type: e.shiftKey
                ? TaskActions.SELECT_TO
                : TaskActions.FOCUS,
            id: task.id,
        });
    }

    onComplete() {
        Dispatcher.dispatch({
            type: TaskActions.MARK_COMPLETE,
            id: this.props.task.id,
        });
    }

    componentDidMount() {
        if (this.props.active) this.inputRef.current.focus();
    }

    componentDidUpdate() {
        if (this.props.active) this.inputRef.current.focus();
    }

    render() {
        const {
            task,
            loadObject: lo,
            active,
            selected,
        } = this.props;
        const section = isSection(task);
        const question = isQuestionable(task);
        let layoutProps;
        if (section) {
            layoutProps = {};
        } else if (! lo.isDone() || task.dead_child) {
            layoutProps = {
                addonBefore: <Button
                    icon="loading"
                    shape="circle"
                    size="small"
                    disabled
                />,
            };
        } else {
            layoutProps = {
                addonBefore: <Button
                    icon="check"
                    shape="circle"
                    size="small"
                    className="complete"
                    onClick={this.onComplete}
                />,
            };
        }
        const deleting = lo.isDeleting() && !task._complete;
        const completing = lo.isDeleting() && task._complete;
        return <Input
            {...layoutProps}
            addonAfter={
                lo.isDeleting()
                    ? <Button
                        type="danger"
                        className={classnames({
                            "complete": completing,
                        })}
                        onClick={this.onUndoDelete}
                    >
                        WAIT, NO!
                    </Button>
                    : <Button
                        icon="delete"
                        shape="circle"
                        size="small"
                        type="danger"
                        onClick={this.onDelete}
                        disabled={task.dead_child}
                    />
            }
            value={task.name}
            placeholder="Write a task name"
            className={classnames({
                "task-section": section,
                "task-active": active,
                "task-selected": selected,
                "task-question": question,
                "task-deleting": deleting,
                "task-completing": completing,
                "task-dead-child": task.dead_child,
            })}
            style={{
                marginLeft: task.depth * 2 + "em",
            }}
            ref={this.inputRef}
            onClick={this.onClick}
            onChange={this.onChange}
            onPaste={this.onPaste}
            onCopy={this.onCopy}
            onKeyDown={this.onKeyDown}
        />;
    }

}

Task.propTypes = {
    task: PropTypes.object.isRequired,
    loadObject: PropTypes.instanceOf(LoadObject).isRequired,
    active: PropTypes.bool.isRequired,
    selected: PropTypes.bool.isRequired,
};

export default Task;
