import { ListItemText } from "@material-ui/core";
import Input from "@material-ui/core/Input";
import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import ShoppingActions from "../../data/ShoppingActions";
import TaskStatus from "../../data/TaskStatus";
import LoadingIconButton from "../common/LoadingIconButton";
import PlaceholderIconButton from "../common/PlaceholderIconButton";
import DontChangeStatusButton from "../plan/DontChangeStatusButton";
import Item from "../plan/Item";
import StatusIconButton from "../plan/StatusIconButton";
import withItemStyles from "../plan/withItemStyles";
import StatusIconIndicator from "./StatusIconIndicator";
import {
    baseItemPropTypes,
    itemPropTypes,
    tuplePropTypes,
} from "./types";

class TaskItem extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
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
        const {
            question,
            pending,
            deleting,
            acquiring,
        } = item;
        let addonBefore = [
            <PlaceholderIconButton
                key="collapse"
                size="small"
            />
        ];
        if (pending) {
            addonBefore.push(
                <LoadingIconButton
                    key="acquire"
                    size="small"
                />);
        } else if (item.status === TaskStatus.ACQUIRED) {
            addonBefore.push(
                <StatusIconIndicator
                    key="acquire"
                    status={TaskStatus.ACQUIRED}
                />);
        } else {
            addonBefore.push(
                <StatusIconButton
                    key="acquire"
                    id={item.id}
                    current={item.status}
                    next={TaskStatus.ACQUIRED}
                />);
        }
        const addonAfter = deleting || acquiring
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
            onClick={this.onClick}
            className={classnames({
                [classes.question]: question,
                [classes.active]: active,
                [classes.acquiring]: acquiring,
                [classes.deleting]: deleting,
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
                    className={classes.text}
                    primary={item.name}
                    secondary={item.path.map(p => p.name).join(" / ")}
                />}
        </Item>;
    }

}

TaskItem.propTypes = {
    ...tuplePropTypes,
    item: PropTypes.shape({
        ...itemPropTypes,
        depth: PropTypes.number.isRequired,
        question: PropTypes.bool.isRequired,
        path: PropTypes.arrayOf(PropTypes.shape(baseItemPropTypes)).isRequired,
    }).isRequired,
};

export default withItemStyles(TaskItem);
