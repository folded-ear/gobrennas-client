import {
    Alert,
    Button,
} from "antd";
import Dispatcher from "../data/dispatcher";
import WindowActions from "../data/WindowActions";
import React from "react";

const NewVersionAvailable = () =>
    <Alert
        type="info"
        message={<div>
            A newer version of Foodinger is available.
            {" "}
            <Button
                size="small"
                onClick={() => Dispatcher.dispatch({
                    type: WindowActions.LAUNCH_NEW_VERSION,
                })}>
                Relaunch
            </Button>
        </div>}
        banner
        closable
        onClose={() => Dispatcher.dispatch({
            type: WindowActions.IGNORE_NEW_VERSION,
        })}
    />;

export default NewVersionAvailable;
