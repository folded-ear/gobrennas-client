import * as React from "react";
import "./App.scss";
import useIsNewVersionAvailable from "./data/useIsNewVersionAvailable";
import { useIsAuthenticated } from "providers/Profile";
import {
    StyledEngineProvider,
    Theme,
    ThemeProvider,
} from "@mui/material/styles";
import { useBfsTheme } from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import { NavigationController } from "features/Navigation/NavigationController";
import RoutingSwitch from "RoutingSwitch";
import routes from "routes";
import NewVersionAvailable from "views/NewVersionAvailable";
import SnackPack from "views/common/SnackPack";

declare module "@mui/styles/defaultTheme" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {}
}

function App() {
    const newVersionAvailable = useIsNewVersionAvailable();
    const authenticated = useIsAuthenticated();

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={useBfsTheme()}>
                <CssBaseline />
                <NavigationController authenticated={authenticated}>
                    {authenticated && newVersionAvailable && (
                        <NewVersionAvailable />
                    )}
                    <RoutingSwitch
                        routes={routes}
                        authenticated={authenticated}
                    />
                </NavigationController>
                <SnackPack />
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default App;
