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
            active,
        } = this.props;
        return <div>
            <Input value={task.name}
                   autoFocus={active}
                   onChange={this.onChange}
            />
        </div>;
    }

}

Task.propTypes = {
    task: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    onRename: PropTypes.func.isRequired,
};

export default Task;