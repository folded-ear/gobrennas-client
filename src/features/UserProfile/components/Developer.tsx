import * as React from "react";
import useIsDevMode, { setDevMode } from "@/data/useIsDevMode";
import Dispatcher from "@/data/dispatcher";
import UserActions from "@/data/UserActions";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import useWindowSize from "@/data/useWindowSize";
import { Grid, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AutoAwesomeIcon, DesktopIcon, MobileIcon } from "@/views/common/icons";
import useFluxStore from "@/data/useFluxStore";
import preferencesStore from "@/data/preferencesStore";

interface RowProps {
    children?: React.ReactNode;
    label: string;
}
const Row = ({ label, children }: RowProps) => (
    <Grid item>
        <Grid container alignItems={"center"} gap={1}>
            <span style={{ minWidth: "6em" }}>{label}:</span>
            {children}
        </Grid>
    </Grid>
);

const DevMode: React.FC = () => {
    const windowSize = useWindowSize();
    const layout = useFluxStore(
        () => preferencesStore.getLayout(),
        [preferencesStore],
    );

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
            <Row label={"Build"}>{import.meta.env.BUILD_TIMESTAMP}</Row>
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
        </Stack>
    );
};

export const Developer: React.FC = () => {
    const devMode = useIsDevMode();

    const handleDevModeChange = (e) => setDevMode(e.target.checked);

    return (
        <>
            <Row label={"Dev Mode"}>
                <Switch
                    checked={devMode}
                    onChange={handleDevModeChange}
                    color="primary"
                />
            </Row>
            {devMode && <DevMode />}
        </>
    );
};
