import React from "react";
import PropTypes from "prop-types";
import {
    Button,
    Form,
    Input,
    Select,
} from "antd";
import Dispatcher from "../data/dispatcher";
import TaskActions from "../data/TaskActions";
import { humanStringComparator } from "../util/comparators";

const isValidName = name =>
    name != null && name.trim().length > 0;

class TaskListHeader extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            name: "",
        };
        this.onCreate = this.onCreate.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
    }

    onNameChange(e) {
        const {value} = e.target;
        this.setState({
            name: value == null ? "" : value.trim(),
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
            name,
        });
    }

    onSelect(id) {
        Dispatcher.dispatch({
            type: TaskActions.SELECT_LIST,
            id,
        })
    }

    render() {
        const {
            activeList,
            allLists,
        } = this.props;
        const {
            name,
        } = this.state;
        return <Form layout="inline">
            {allLists && allLists.length > 0 && <Form.Item label="Select a List:">
                <Select style={{minWidth: 120}}
                        onChange={this.onSelect}
                        value={activeList && activeList.id}
                >
                    {allLists.sort(humanStringComparator).map(l =>
                        <Select.Option key={l.id}
                                       value={l.id}
                        >
                            {l.name}
                        </Select.Option>,
                    )}
                </Select>
            </Form.Item>}
            <Form.Item>
                <Input.Search placeholder="New List..."
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
};

export default TaskListHeader;