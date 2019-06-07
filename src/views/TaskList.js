import React from "react";

class TaskList extends React.PureComponent {

    render() {
        const {
            name,
        } = this.props;
        return <h1>Hello {name}!</h1>;
    }

}

export default TaskList;