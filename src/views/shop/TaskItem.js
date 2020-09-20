import { ListItemText } from "@material-ui/core";
import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
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

    render() {
        const {
            item,
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
            depth={1}
            prefix={addonBefore}
            suffix={addonAfter}
            selected={active}
            className={classnames({
                [classes.question]: question,
                [classes.acquiring]: acquiring,
                [classes.deleting]: deleting,
            })}
        >
            <ListItemText>
                {item.name}
                {item.path.map(p => " / " + p.name).join("")}
            </ListItemText>
        </Item>;
    }

}

TaskItem.propTypes = {
    ...tuplePropTypes,
    item: PropTypes.shape({
        ...itemPropTypes,
        question: PropTypes.bool.isRequired,
        path: PropTypes.arrayOf(PropTypes.shape(baseItemPropTypes)).isRequired,
    }).isRequired,
};

export default withItemStyles(TaskItem);
