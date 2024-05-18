import * as React from "react";
import { HTMLProps, useState } from "react";
import useIsDevMode, { setDevMode } from "data/useIsDevMode";
import Dispatcher from "data/dispatcher";
import UserActions from "data/UserActions";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import useWindowSize from "data/useWindowSize";
import preval from "preval.macro";
import {
    Button,
    Grid,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
} from "@mui/material";
import { AutoAwesomeIcon, DesktopIcon, MobileIcon } from "views/common/icons";
import useFluxStore from "../../../data/useFluxStore";
import preferencesStore from "../../../data/preferencesStore";
import { colorHash, planColors } from "../../../constants/colors";
import Input from "@mui/material/Input";
import {
    blue,
    blueGrey,
    indigo,
    lightGreen,
    lime,
    purple,
    red,
    teal,
} from "@mui/material/colors";

const dateTimeStamp = preval`module.exports = new Date().toISOString();`;

interface RowProps {
    label: string;
}
const Row: React.FC<RowProps> = ({ label, children }) => (
    <Grid item>
        <Grid container alignItems={"center"} gap={1}>
            <span style={{ minWidth: "6em" }}>{label}:</span>
            {children}
        </Grid>
    </Grid>
);

interface SwatchProps extends HTMLProps<any> {
    color?: string;
}

const Swatch: React.FC<SwatchProps> = ({ color, style, ...passthrough }) => (
    <span
        style={{
            border: color ? undefined : "1px solid #ddd",
            backgroundColor: color,
            display: "inline-block",
            minWidth: "1.5em",
            minHeight: "1.5em",
            ...style,
        }}
        {...passthrough}
    />
);

const SAMPLES_PER_SWATCH = 100;
const DevMode: React.FC = () => {
    const windowSize = useWindowSize();
    const layout = useFluxStore(
        () => preferencesStore.getLayout(),
        [preferencesStore],
    );
    const [toColorHash, setToColorHash] = useState("");
    const [samples, setSamples] = useState<number[]>([]);

    function handleLayoutChange(e, layout) {
        if (!layout) return;
        Dispatcher.dispatch({
            type: UserActions.SET_LAYOUT,
            layout,
        });
    }

    function handleResample() {
        const samples = planColors.map(() => 0);
        for (let i = planColors.length * SAMPLES_PER_SWATCH; i > 0; i--) {
            samples[
                planColors.indexOf(
                    colorHash(Math.random().toString().substring(2)),
                )
            ] += 1;
        }
        setSamples(samples);
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
            <Row label={"Old Colors"}>
                {[
                    // manually lined up with nearest match from the new ones
                    undefined,
                    undefined,
                    undefined,
                    red[500],
                    undefined,
                    lime[500],
                    lightGreen[900],
                    undefined,
                    teal[300],
                    blue[300],
                    indigo[900],
                    blueGrey[500],
                    undefined,
                    undefined,
                    undefined,
                    purple[400],
                ].map((c, i) => (
                    <Swatch key={i} color={c} />
                ))}
            </Row>
            <Row label={"New Colors"}>
                {planColors.map((c, i) => (
                    <Swatch
                        key={c}
                        color={c}
                        style={
                            samples[i]
                                ? {
                                      minHeight: `${
                                          (1.5 / SAMPLES_PER_SWATCH) *
                                          samples[i]
                                      }em`,
                                  }
                                : undefined
                        }
                    />
                ))}
                <Tooltip
                    title={
                        "Color hash a bunch of random strings and display the distribution via swatch heights."
                    }
                >
                    <Button
                        variant={"contained"}
                        color={"secondary"}
                        size={"small"}
                        onClick={handleResample}
                    >
                        Resample
                    </Button>
                </Tooltip>
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
