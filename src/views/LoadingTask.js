import {
    Button,
    Input,
} from "antd";
import React from "react";

class LoadingTask extends React.PureComponent {

    render() {
        return <Input
            placeholder="Loading..."
            addonBefore={<Button
                icon="loading"
                shape="circle"
                size="small"
                disabled
            />}
        />;
    }

}

export default LoadingTask;