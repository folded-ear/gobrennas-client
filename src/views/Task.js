import React from "react";
import PropTypes from "prop-types";
import {
    Button,
    Input,
} from "antd";
import TaskActions from "../data/TaskActions";
import Dispatcher from "../data/dispatcher";
import classnames from "classnames";
import "./Task.scss";
import LoadObject from "../util/LoadObject";
import TaskStore from "../data/TaskStore";
import {
    isQuestionable,
    isSection,
} from "../data/tasks";

class Task extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onComplete = this.onComplete.bind(this);
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
        })
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
                    Dispatcher.dispatch({
                        type: TaskActions.DELETE_TASK_FORWARD,
                        id: this.props.task.id
                    });
                }
                break;
            case "Tab":
                // suppress the event (eventually nest)
                e.preventDefault();
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
        } else if (! lo.isDone()) {
            layoutProps = {
                addonBefore: <Button icon="loading"
                                     shape="circle"
                                     size="small"
                                     disabled
                />,
            };
        } else {
            layoutProps = {
                addonBefore: <Button icon="check"
                                     shape="circle"
                                     size="small"
                                     onClick={this.onComplete}
                />,
            };
        }
        const input = <Input {...layoutProps}
                             value={task.name}
                             placeholder="Write a task name"
                             className={classnames({
                                 "task-active": active,
                                 "task-selected": selected,
                                 "task-question": question,
                                 "task-deleting": lo.isDeleting(),
                             })}
                             ref={this.inputRef}
                             onClick={this.onClick}
                             onChange={this.onChange}
                             onPaste={this.onPaste}
                             onCopy={this.onCopy}
                             onKeyDown={this.onKeyDown}
        />;
        return section
            ? <Input.Group className={classnames("task-section", {
                "task-active": active,
                "task-selected": selected,
            })}
            >{input}</Input.Group>
            : input;
    }

}

Task.propTypes = {
    task: PropTypes.object.isRequired,
    loadObject: PropTypes.instanceOf(LoadObject).isRequired,
    active: PropTypes.bool.isRequired,
    selected: PropTypes.bool.isRequired,
};

export default Task;
