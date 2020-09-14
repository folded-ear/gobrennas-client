import { ListItemText } from "@material-ui/core";
import Input from "@material-ui/core/Input";
import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import ShoppingActions from "../../data/ShoppingActions";
import { isQuestionable } from "../../data/tasks";
import TaskStatus from "../../data/TaskStatus";
import LoadingIconButton from "../common/LoadingIconButton";
import PlaceholderIconButton from "../common/PlaceholderIconButton";
import DontChangeStatusButton from "../plan/DontChangeStatusButton";
import Item from "../plan/Item";
import StatusIconButton from "../plan/StatusIconButton";
import withItemStyles from "../plan/withItemStyles";

class Raw extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.inputRef = React.createRef();
    }

    onChange(e) {
        const { value } = e.target;
        const {
            item,
        } = this.props;
        Dispatcher.dispatch({
            type: ShoppingActions.RENAME_ITEM,
            id: item.id,
            name: value,
        });
    }

    onKeyDown(e) {
        const {
            key,
            ctrlKey,
            shiftKey,
        } = e;
        switch (key) { // eslint-disable-line default-case
            case "ArrowUp":
                e.preventDefault();
                if (shiftKey || ctrlKey) break;
                Dispatcher.dispatch({
                    type: ShoppingActions.FOCUS_PREVIOUS,
                });
                break;
            case "ArrowDown":
                e.preventDefault();
                if (shiftKey || ctrlKey) break;
                Dispatcher.dispatch({
                    type: ShoppingActions.FOCUS_NEXT,
                });
                break;
        }
    }

    onClick(e) {
        const {
            active,
            item,
        } = this.props;
        if (active) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) return;
        Dispatcher.dispatch({
            type: ShoppingActions.FOCUS,
            id: item.id,
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
            item,
            depth,
            active,
            classes,
        } = this.props;
        const lo = item.lo;
        const question = isQuestionable(item);
        let addonBefore = [
            <PlaceholderIconButton
                key="collapse"
                size="small"
            />
        ];
        if (!lo.isDone()) {
            addonBefore.push(
                <LoadingIconButton
                    key="complete"
                    size="small"
                />);
        } else {
            addonBefore.push(
                <StatusIconButton
                    key="complete"
                    id={item.id}
                    current={item.status}
                    next={TaskStatus.ACQUIRED}
                />);
        }
        const deleting = lo.isDeleting() && item._next_status === TaskStatus.DELETED;
        const completing = lo.isDeleting() && item._next_status === TaskStatus.COMPLETED;
        const acquiring = lo.isUpdating() && item._next_status === TaskStatus.ACQUIRED;
        const addonAfter = deleting || completing || acquiring
            ? <DontChangeStatusButton
                key="delete"
                id={item.id}
                next={item._next_status}
            />
            : <StatusIconButton
                key="delete"
                id={item.id}
                next={TaskStatus.DELETED}
            />;

        return <Item
            depth={depth}
            prefix={addonBefore}
            suffix={addonAfter}
            selected={active}
            onClick={this.onClick}
            className={classnames({
                [classes.question]: question,
                [classes.deleting]: deleting,
                [classes.completing]: completing,
            })}
        >
            {active
                ? <Input
                    fullWidth
                    value={item.name}
                    placeholder="Write a task name"
                    disableUnderline
                    inputRef={this.inputRef}
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                />
                : <ListItemText
                    primary={item.name}
                    className={classes.text}
                />}
        </Item>;
    }

}

Raw.propTypes = {
    depth: PropTypes.number.isRequired,
    item: PropTypes.object.isRequired,
    active: PropTypes.bool,
    classes: PropTypes.object.isRequired,
};

export default withItemStyles(Raw);
