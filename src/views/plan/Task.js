import {
    IconButton,
    ListItemText,
} from "@material-ui/core";
import Input from "@material-ui/core/Input";
import {
    ArrowDropDown,
    ArrowRight,
} from "@material-ui/icons";
import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import TaskActions from "../../data/TaskActions";
import {
    isExpanded,
    isParent,
    isQuestionable,
    isSection,
} from "../../data/tasks";
import TaskStore from "../../data/TaskStore";
import LoadObject from "../../util/LoadObject";
import CompleteIconButton from "../common/CompleteIconButton";
import DeleteIconButton from "../common/DeleteIconButton";
import DontCompleteButton from "../common/DontCompleteButton";
import DontDeleteButton from "../common/DontDeleteButton";
import LoadingIconButton from "../common/LoadingIconButton";
import PlaceholderIconButton from "../common/PlaceholderIconButton";
import Item from "./Item";

class Task extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.onToggleExpanded = this.onToggleExpanded.bind(this);
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
            case ".":
                if (ctrlKey) {
                    this.onToggleExpanded();
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

    onToggleExpanded() {
        Dispatcher.dispatch({
            type: TaskActions.TOGGLE_EXPANDED,
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
            depth,
            loadObject: lo,
            active,
            selected,
            ancestorDeleting,
        } = this.props;
        const section = isSection(task);
        const parent = isParent(task);
        const expanded = isExpanded(task);
        const question = isQuestionable(task);
        let addonBefore = [];
        if (parent) {
            const CollapseIcon = expanded ? ArrowDropDown : ArrowRight;
            addonBefore.push(
                <IconButton
                    key="collapse"
                    size="small"
                    onClick={this.onToggleExpanded}
                >
                    <CollapseIcon />
                </IconButton>);
        } else {
            addonBefore.push(
                <PlaceholderIconButton
                    key="collapse"
                    size="small"
                />);
        }
        if (section) {
            addonBefore.push(
                <PlaceholderIconButton
                    key="complete"
                    size="small"
                />);
        } else if (! lo.isDone() || ancestorDeleting) {
            addonBefore.push(
                <LoadingIconButton
                    key="complete"
                    size="small"
                />);
        } else {
            addonBefore.push(
                <CompleteIconButton
                    key="complete"
                    size="small"
                    onClick={this.onComplete}
                />);
        }
        const deleting = lo.isDeleting() && !task._complete;
        const completing = lo.isDeleting() && task._complete;
        const WaitNoButton = completing ? DontCompleteButton : DontDeleteButton;
        const addonAfter = lo.isDeleting() && !ancestorDeleting
            ? <WaitNoButton
                key="delete"
                size="small"
                onClick={this.onUndoDelete}
            />
            : <DeleteIconButton
                key="delete"
                size="small"
                onClick={this.onDelete}
                disabled={ancestorDeleting}
            />;

        return <Item
            depth={depth}
            prefix={addonBefore}
            suffix={addonAfter}
            className={classnames({
                "task-item-section": section,
                "task-item-active": active,
                "task-item-selected": selected,
                "task-item-question": question,
                "task-item-deleting": deleting,
                "task-item-completing": completing,
                "task-item-ancestor-deleting": ancestorDeleting,
            })}
        >
            {active
                ? <Input
                    fullWidth
                    value={task.name}
                    placeholder="Write a task name"
                    disableUnderline
                    inputRef={this.inputRef}
                    onClick={this.onClick}
                    onChange={this.onChange}
                    onPaste={this.onPaste}
                    onCopy={this.onCopy}
                    onKeyDown={this.onKeyDown}
                />
                : <ListItemText
                    primary={task.name}
                    onClick={this.onClick}
                />}
        </Item>;
    }

}

Task.propTypes = {
    depth: PropTypes.number.isRequired,
    task: PropTypes.object.isRequired,
    loadObject: PropTypes.instanceOf(LoadObject).isRequired,
    active: PropTypes.bool.isRequired,
    ancestorDeleting: PropTypes.bool,
    selected: PropTypes.bool.isRequired,
};

export default Task;
