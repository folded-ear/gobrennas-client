import IconButton from "@material-ui/core/IconButton";
import {
    Button,
    Drawer,
    Form,
    Input,
    Select,
} from "antd";
import { Container } from "flux/utils";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../data/dispatcher";
import TaskActions from "../data/TaskActions";
import WindowStore from "../data/WindowStore";
import { humanStringComparator } from "../util/comparators";
import {
    CollapseAll,
    ExpandAll,
} from "./common/icons";
import TaskListSidebar from "./TaskListSidebar";

const isValidName = name =>
    name != null && name.trim().length > 0;

class TaskListHeader extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            name: "",
        };
        this.onShowDrawer = this.onShowDrawer.bind(this);
        this.onCloseDrawer = this.onCloseDrawer.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onExpandAll = this.onExpandAll.bind(this);
        this.onCollapseAll = this.onCollapseAll.bind(this);
    }

    onShowDrawer() {
        Dispatcher.dispatch({
            type: TaskActions.LIST_DETAIL_VISIBILITY,
            visible: true,
        });
    }

    onCloseDrawer() {
        Dispatcher.dispatch({
            type: TaskActions.LIST_DETAIL_VISIBILITY,
            visible: false,
        });
    }

    onNameChange(e) {
        const {value} = e.target;
        this.setState({
            name: value == null ? "" : value,
        });
    }

    onCreate() {
        const {name} = this.state;
        if (!isValidName(name)) return;
        this.setState({
            name: "",
        });
        Dispatcher.dispatch({
            type: TaskActions.CREATE_LIST,
            name: name.trim(),
        });
    }

    onSelect(id) {
        Dispatcher.dispatch({
            type: TaskActions.SELECT_LIST,
            id,
        });
    }

    onExpandAll() {
        Dispatcher.dispatch({
            type: TaskActions.EXPAND_ALL,
        });
    }

    onCollapseAll() {
        Dispatcher.dispatch({
            type: TaskActions.COLLAPSE_ALL,
        });
    }

    render() {
        const {
            activeList,
            allLists,
            listDetailVisible,
            windowWidth,
        } = this.props;
        const {
            name,
        } = this.state;
        return <Form layout="inline">
            {activeList && <Form.Item>
                <IconButton
                    aria-label="expand-all"
                    onClick={this.onExpandAll}
                >
                    <ExpandAll />
                </IconButton>
                <IconButton
                    aria-label="collapse-all"
                    onClick={this.onCollapseAll}
                >
                    <CollapseAll />
                </IconButton>
            </Form.Item>}
            {allLists && allLists.length > 0 && <React.Fragment>
                <Form.Item
                    label="Select a List">
                    <Select
                        style={{minWidth: 120}}
                        onChange={this.onSelect}
                        value={activeList && activeList.id}
                    >
                        {allLists.sort(humanStringComparator).map(l =>
                            <Select.Option
                                key={l.id}
                                value={l.id}
                            >
                                {l.name}
                            </Select.Option>,
                        )}
                    </Select>
                </Form.Item>
                {activeList && <React.Fragment>
                    <Form.Item>
                        <Button
                            icon="edit"
                            shape="circle"
                            type={listDetailVisible ? "primary" : "default"}
                            onClick={this.onShowDrawer}
                        />
                    </Form.Item>
                    <Drawer
                        visible={listDetailVisible}
                        title="List Info"
                        width={Math.min(500, windowWidth - 50)}
                        onClose={this.onCloseDrawer}
                    >
                        <TaskListSidebar list={activeList} />
                    </Drawer>
                </React.Fragment>}
            </React.Fragment>}
            <Form.Item
                labelCol={{
                    offset: 12,
                }}>
                <Input.Search
                    placeholder="New List..."
                    value={name}
                    onPressEnter={this.onCreate}
                    enterButton={<Button
                        disabled={!isValidName(name)}>Create</Button>}
                    onSearch={this.onCreate}
                    onChange={this.onNameChange}
                />
            </Form.Item>
        </Form>;
    }

}

TaskListHeader.propTypes = {
    allLists: PropTypes.array.isRequired,
    activeList: PropTypes.object,
    listDetailVisible: PropTypes.bool.isRequired,
    windowWidth: PropTypes.number.isRequired,
};

export default Container.createFunctional(
    props => <TaskListHeader {...props} />,
    () => [
        WindowStore,
    ],
    (prev, props) => {
        return {
            ...props,
            windowWidth: WindowStore.getSize().width,
        };
    },
    { withProps: true }
);
