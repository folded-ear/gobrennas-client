import * as React from "react";
import useIsDevMode from "data/useIsDevMode";
import Dispatcher from "data/dispatcher";
import UserActions from "data/UserActions";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import useWindowSize from "data/useWindowSize";
import preval from "preval.macro";
import {ToggleButton, ToggleButtonGroup} from "@mui/material";
import {AutoAwesome, Laptop, Smartphone} from "@mui/icons-material";
import useFluxStore from "../../../data/useFluxStore";
import preferencesStore from "../../../data/preferencesStore";

const dateTimeStamp = preval`module.exports = new Date().toISOString();`;

const DevMode: React.FC = () => {
    const windowSize = useWindowSize();
    const layout = useFluxStore(
        () => preferencesStore.getLayout(),
        [preferencesStore]
    );

    function handleLayoutChange(e, layout) {
        if (!layout) return;
        Dispatcher.dispatch({
            type: UserActions.SET_LAYOUT,
            layout,
        });
    }

    return <React.Fragment>
        <Divider />
        <p>
            Window: {windowSize.width}x{windowSize.height}
        </p>
        <p>
            Build: {dateTimeStamp}
        </p>
        <p>
            Layout: <ToggleButtonGroup
            size={"small"}
            exclusive
            value={layout}
            onChange={handleLayoutChange}>
            <ToggleButton value={"auto"}
                          title={"auto / responsive"}>
                <AutoAwesome/>
            </ToggleButton>
            <ToggleButton value={"desktop"}
                          title={"desktop"}>
                <Laptop/>
            </ToggleButton>
            <ToggleButton value={"mobile"}
                          title={"mobile"}>
                <Smartphone/>
            </ToggleButton>
        </ToggleButtonGroup>
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
