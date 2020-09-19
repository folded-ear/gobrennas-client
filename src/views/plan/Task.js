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
import TaskStatus from "../../data/TaskStatus";
import TaskStore from "../../data/TaskStore";
import LoadObject from "../../util/LoadObject";
import LoadingIconButton from "../common/LoadingIconButton";
import PlaceholderIconButton from "../common/PlaceholderIconButton";
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
        if (!lo.isDone() || ancestorDeleting) {
            addonBefore.push(
                <LoadingIconButton
                    key="complete"
                    size="small"
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
                    current={parent ? null : task.status}
                    next={TaskStatus.COMPLETED}
                />);
        }
        const deleting = lo.isDeleting() && task._next_status === TaskStatus.DELETED;
        const completing = lo.isDeleting() && task._next_status === TaskStatus.COMPLETED;
        const addonAfter = lo.isDeleting() && !ancestorDeleting
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
            selected={active}
            onClick={this.onClick}
            className={classnames({
                [classes.section]: section,
                [classes.selected]: selected,
                [classes.question]: question,
                [classes.deleting]: deleting,
                [classes.completing]: completing,
                [classes.ancestorDeleting]: ancestorDeleting,
            })}
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
    active: PropTypes.bool.isRequired,
    ancestorDeleting: PropTypes.bool,
    selected: PropTypes.bool.isRequired,
    classes: PropTypes.object.isRequired,
};

export default withItemStyles(Task);
