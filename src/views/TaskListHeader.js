import React from "react";
import PropTypes from "prop-types";
import {
    Button,
    Form,
    Input,
    Select,
} from "antd";

const isValidName = name =>
    name != null && name.trim().length > 0;

class TaskListHeader extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            name: "",
        };
        this.onCreate = this.onCreate.bind(this);
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
        this.props.onCreate(name);
    }

    render() {
        const {
            activeList,
            allLists,
            onSelect,
        } = this.props;
        const {
            name,
        } = this.state;
        return <Form layout="inline">
            {allLists && allLists.length > 0 && <Form.Item label="Select a List:">
                <Select style={{minWidth: 120}}
                        onChange={onSelect}
                        value={activeList.id}
                >
                    {allLists.map(l =>
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
    onCreate: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default TaskListHeader;