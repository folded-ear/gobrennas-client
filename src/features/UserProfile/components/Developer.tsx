import * as React from "react";
import useIsDevMode from "data/useIsDevMode";
import Dispatcher from "data/dispatcher";
import UserActions from "data/UserActions";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import useWindowSize from "data/useWindowSize";
import preval from "preval.macro";

const dateTimeStamp = preval`module.exports = new Date().toISOString();`;

const DevMode: React.FC = () => {
    const windowSize = useWindowSize();
    return <React.Fragment>
        <Divider />
        <p>
            Window: {windowSize.width}x{windowSize.height}
        </p>
        <p>
            Build: {dateTimeStamp}
        </p>
    </React.Fragment>;
};

export const Developer: React.FC = () => {
    const isDevMode = useIsDevMode();

    const handleDevModeChange = (e) => {
        Dispatcher.dispatch({
            type: UserActions.SET_DEV_MODE,
            enabled: e.target.checked,
        });
    };

    return <>
        Dev Mode:
        {" "}
        <Switch
            checked={isDevMode}
            onChange={handleDevModeChange}
            color="primary"
        />
        {isDevMode && <DevMode />}
    </>;
};
