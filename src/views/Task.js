import React from "react";
import PropTypes from "prop-types";
import { Input } from "antd";

class Task extends React.PureComponent {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        const { value } = e.target;
        const {
            task,
            onRename,
        } = this.props;
        onRename(task.id, value);
    }

    render() {
        const {
            task,
        } = this.props;
        return <div>
            <Input value={task.name} onChange={this.onChange} />
        </div>;
    }

}

Task.propTypes = {
    task: PropTypes.object.isRequired,
    onRename: PropTypes.func.isRequired,
};

export default Task;