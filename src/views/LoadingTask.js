import React from "react";
import {
    Button,
    Input,
} from "antd";

class LoadingTask extends React.PureComponent {

    render() {
        return <Input placeholder="Loading..."
                      addonBefore={<Button icon="loading"
                                           shape="circle"
                                           size="small"
                                           disabled
                      />}
        />;
    }

}

export default LoadingTask;