import dispatcher, { ActionType } from "@/data/dispatcher";
import preferencesStore, { Layout } from "@/data/preferencesStore";
import useFluxStore from "@/data/useFluxStore";
import useIsDevMode, { setDevMode } from "@/data/useIsDevMode";
import useWindowSize from "@/data/useWindowSize";
import { AutoAwesomeIcon, DesktopIcon, MobileIcon } from "@/views/common/icons";
import { Grid, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import Divider from "@mui/material/Divider";
import Switch, { SwitchProps } from "@mui/material/Switch";
import React from "react";

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

    function handleLayoutChange(e, layout: Layout) {
        if (!layout) return;
        dispatcher.dispatch({
            type: ActionType.USER__SET_LAYOUT,
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
                    <ToggleButton
                        value={"auto" satisfies Layout}
                        title={"auto / responsive"}
                    >
                        <AutoAwesomeIcon />
                    </ToggleButton>
                    <ToggleButton
                        value={"desktop" satisfies Layout}
                        title={"desktop"}
                    >
                        <DesktopIcon />
                    </ToggleButton>
                    <ToggleButton
                        value={"mobile" satisfies Layout}
                        title={"mobile"}
                    >
                        <MobileIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Row>
        </Stack>
    );
};

export const Developer: React.FC = () => {
    const devMode = useIsDevMode();

    const handleDevModeChange: SwitchProps["onChange"] = (e) =>
        setDevMode(e.target.checked);

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
