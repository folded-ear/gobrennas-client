import * as React from "react";
import useIsDevMode from "../../../data/useIsDevMode";
import Dispatcher from "../../../data/LibraryStore";
import UserActions from "../../../data/UserActions";
import Divider from "@material-ui/core/Divider";
import Switch from "@material-ui/core/Switch";
import useWindowSize from "../../../data/useWindowSize";
import preval from "preval.macro";

const dateTimeStamp = preval`module.exports = new Date().toISOString();`;

const DevMode = () => {
    const windowSize = useWindowSize();
    return <React.Fragment>
        <p>
            Window: {windowSize.width}x{windowSize.height}
        </p>
        <p>
            Build: {dateTimeStamp}
        </p>
    </React.Fragment>;
};

export const Developer = () => {
    const isDevMode = useIsDevMode();

    const handleDevModeChange = (e) => {
        Dispatcher.dispatch({
            type: UserActions.SET_DEV_MODE,
            enabled: e.target.checked,
        });
    };

    return <React.Fragment>
        <Divider />
        Dev Mode:
        {" "}
        <Switch
            checked={isDevMode}
            onChange={handleDevModeChange}
            color="primary"
        />
        {isDevMode && <DevMode />}
    </React.Fragment>;
};