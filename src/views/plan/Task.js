import { ListItemText } from "@material-ui/core";
import Input from "@material-ui/core/Input";
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
import TaskStatus from "../../data/TaskStatus";
import TaskStore from "../../data/TaskStore";
import LoadObject from "../../util/LoadObject";
import LoadingIconButton from "../common/LoadingIconButton";
import PlaceholderIconButton from "../common/PlaceholderIconButton";
import CollapseIconButton from "./CollapseIconButton";
import DontChangeStatusButton from "./DontChangeStatusButton";
import Item from "./Item";
import StatusIconButton from "./StatusIconButton";
import withItemStyles from "./withItemStyles";

class Task extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onCopy = this.onCopy.bind(this);
        this.onPaste = this.onPaste.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onToggleExpanded = this.onToggleExpanded.bind(this);
        this.onDragDrop = this.onDragDrop.bind(this);
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
                } else if (shiftKey) {
                    e.preventDefault();
                    Dispatcher.dispatch({
                        type: TaskActions.DELETE_SELECTED,
                    });
                }
                break;
            case "Delete":
                // if the value is empty, delete the task and focus next
                if (value.length === 0) {
                    e.preventDefault();
                    Dispatcher.dispatch({
                        type: TaskActions.DELETE_TASK_FORWARD,
                        id: this.props.task.id,
                    });
                } else if (shiftKey) {
                    e.preventDefault();
                    Dispatcher.dispatch({
                        type: TaskActions.DELETE_SELECTED,
                    });
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
                    });
                } else if (ctrlKey) {
                    // move all selected tasks up one (if a predecessor exists)
                    Dispatcher.dispatch({
                        type: TaskActions.MOVE_PREVIOUS,
                    });
                } else {
                    Dispatcher.dispatch({
                        type: TaskActions.FOCUS_PREVIOUS,
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
                    });
                } else if (ctrlKey) {
                    // move all selected tasks down one (if a follower exists)
                    Dispatcher.dispatch({
                        type: TaskActions.MOVE_NEXT,
                    });
                } else {
                    Dispatcher.dispatch({
                        type: TaskActions.FOCUS_NEXT,
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

    onToggleExpanded(e) {
        if (e) e.stopPropagation();
        Dispatcher.dispatch({
            type: TaskActions.TOGGLE_EXPANDED,
            id: this.props.task.id,
        });
    }

    onDragDrop(id, targetId, vertical, horizontal) {
        const {
            task,
        } = this.props;
        const action = {
            type: TaskActions.MOVE_SUBTREE,
            id,
        };
        if (horizontal === "right") {
            action.parentId = targetId;
            if (isExpanded(task)) {
                action.after = null;
            } else {
                action.before = null;
            }
        } else {
            action.parentId = task.parentId;
            if (vertical === "above") {
                action.before = targetId;
            } else {
                action.after = targetId;
            }
        }
        Dispatcher.dispatch(action);
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
            classes,
        } = this.props;
        const section = isSection(task);
        const parent = isParent(task);
        const expanded = isExpanded(task);
        const question = isQuestionable(task);
        const deleting = task._next_status === TaskStatus.DELETED;
        const completing = task._next_status === TaskStatus.COMPLETED;
        const acquiring = task._next_status === TaskStatus.ACQUIRED;
        const needing = task._next_status === TaskStatus.NEEDED;
        let nextStatus = TaskStatus.COMPLETED;

        if (task.status === TaskStatus.NEEDED) {
            if (task._next_status === TaskStatus.ACQUIRED) {
                nextStatus = TaskStatus.NEEDED;
            } else if (task._next_status === TaskStatus.COMPLETED) {
                nextStatus = TaskStatus.ACQUIRED;
            } else {
                nextStatus = TaskStatus.COMPLETED;
            }
        } else if (task.status === TaskStatus.ACQUIRED) {
            if (task._next_status === TaskStatus.NEEDED) {
                nextStatus = TaskStatus.ACQUIRED;
            } else if (task._next_status === TaskStatus.COMPLETED) {
                nextStatus = TaskStatus.NEEDED;
            } else {
                nextStatus = TaskStatus.COMPLETED;
            }
        } else {
            // eslint-disable-next-line no-console
            console.warn(`Bad status for task#${task.id}: ${task.status} -> ${task._next_status}`);
        }

        let addonBefore = [];
        if (parent) {
            addonBefore.push(
                <CollapseIconButton
                    key="collapse"
                    expanded={expanded}
                    onClick={this.onToggleExpanded}
                />);
        } else {
            addonBefore.push(
                <PlaceholderIconButton
                    key="collapse"
                    size="small"
                />);
        }
        if (lo.isLoading() || deleting || ancestorDeleting) {
            addonBefore.push(
                <LoadingIconButton
                    key="complete"
                />);
        } else if (section) {
            addonBefore.push(
                <PlaceholderIconButton
                    key="complete"
                    size="small"
                />);
        } else {
            addonBefore.push(
                <StatusIconButton
                    key="complete"
                    id={task.id}
                    current={task.status}
                    next={nextStatus}
                />);
        }
        const addonAfter = deleting && !ancestorDeleting
            ? <DontChangeStatusButton
                key="delete"
                id={task.id}
                next={task._next_status}
            />
            : <StatusIconButton
                key="delete"
                id={task.id}
                next={TaskStatus.DELETED}
                disabled={ancestorDeleting}
            />;

        return <Item
            depth={depth}
            prefix={addonBefore}
            suffix={addonAfter}
            onClick={this.onClick}
            className={classnames({
                [classes.section]: section,
                [classes.active]: active,
                [classes.selected]: selected,
                [classes.question]: question,
                [classes.deleting]: deleting,
                [classes.completing]: completing,
                [classes.acquiring]: acquiring,
                [classes.needing]: needing,
                [classes.ancestorDeleting]: ancestorDeleting,
            })}
            dragId={task.id}
            onDragDrop={this.onDragDrop}
        >
            {active
                ? <Input
                    fullWidth
                    value={task.name}
                    placeholder="Write a task name"
                    disableUnderline
                    inputRef={this.inputRef}
                    onChange={this.onChange}
                    onPaste={this.onPaste}
                    onCopy={this.onCopy}
                    onKeyDown={this.onKeyDown}
                />
                : <ListItemText
                    primary={task.name}
                    className={classes.text}
                />}
        </Item>;
    }

}

Task.propTypes = {
    depth: PropTypes.number.isRequired,
    task: PropTypes.object.isRequired,
    loadObject: PropTypes.instanceOf(LoadObject).isRequired,
    active: PropTypes.bool,
    selected: PropTypes.bool,
    ancestorDeleting: PropTypes.bool,
    classes: PropTypes.object.isRequired,
};

export default withItemStyles(Task);
