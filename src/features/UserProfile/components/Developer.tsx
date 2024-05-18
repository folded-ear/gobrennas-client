import * as React from "react";
import { useState } from "react";
import useIsDevMode, { setDevMode } from "data/useIsDevMode";
import Dispatcher from "data/dispatcher";
import UserActions from "data/UserActions";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import useWindowSize from "data/useWindowSize";
import preval from "preval.macro";
import { Grid, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AutoAwesomeIcon, DesktopIcon, MobileIcon } from "views/common/icons";
import useFluxStore from "../../../data/useFluxStore";
import preferencesStore from "../../../data/preferencesStore";
import { colorHash, planColors } from "../../../constants/colors";
import Input from "@mui/material/Input";

const dateTimeStamp = preval`module.exports = new Date().toISOString();`;

interface RowProps {
    label: string;
}
const Row: React.FC<RowProps> = ({ label, children }) => (
    <Grid item>
        <Grid container alignItems={"center"} gap={1}>
            <span>{label}:</span>
            {children}
        </Grid>
    </Grid>
);

interface SwatchProps {
    color?: string;
}

const Swatch: React.FC<SwatchProps> = ({ color, children }) => (
    <span
        style={{
            border: color ? undefined : "1px solid #999",
            backgroundColor: color,
            display: "inline-block",
            minWidth: "1.5em",
            minHeight: "1.5em",
        }}
    >
        {children}
    </span>
);

const DevMode: React.FC = () => {
    const windowSize = useWindowSize();
    const layout = useFluxStore(
        () => preferencesStore.getLayout(),
        [preferencesStore],
    );
    const [toColorHash, setToColorHash] = useState("");

    function handleLayoutChange(e, layout) {
        if (!layout) return;
        Dispatcher.dispatch({
            type: UserActions.SET_LAYOUT,
            layout,
        });
    }

    return (
        <Stack gap={2}>
            <Divider />
            <Row label={"Window"}>
                {windowSize.width}x{windowSize.height}
            </Row>
            <Row label={"Build"}>{dateTimeStamp}</Row>
            <Row label={"Layout"}>
                <ToggleButtonGroup
                    size={"small"}
                    exclusive
                    value={layout}
                    onChange={handleLayoutChange}
                >
                    <ToggleButton value={"auto"} title={"auto / responsive"}>
                        <AutoAwesomeIcon />
                    </ToggleButton>
                    <ToggleButton value={"desktop"} title={"desktop"}>
                        <DesktopIcon />
                    </ToggleButton>
                    <ToggleButton value={"mobile"} title={"mobile"}>
                        <MobileIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Row>
            <Row label={"Plan Colors"}>
                {planColors.map((c) => (
                    <Swatch key={c} color={c} />
                ))}
            </Row>
            <Row label={"Color Hash"}>
                <Swatch
                    color={
                        toColorHash === "" ? undefined : colorHash(toColorHash)
                    }
                />
                <Input
                    value={toColorHash}
                    placeholder={"string to hash..."}
                    onChange={(e) => setToColorHash(e.target.value)}
                />
            </Row>
        </Stack>
    );
};

export const Developer: React.FC = () => {
    const isDevMode = useIsDevMode();

    const handleDevModeChange = (e) => setDevMode(e.target.checked);

    return (
        <>
            <Row label={"Dev Mode"}>
                <Switch
                    checked={isDevMode}
                    onChange={handleDevModeChange}
                    color="primary"
                />
            </Row>
            {isDevMode && <DevMode />}
        </>
    );
};
