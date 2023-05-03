import * as React from "react";
import "./App.scss";
import useIsNewVersionAvailable from "./data/useIsNewVersionAvailable";
import { useIsAuthenticated } from "./providers/Profile";
import {
    StyledEngineProvider,
    Theme,
    ThemeProvider,
} from "@mui/material/styles";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import { NavigationController } from "features/Navigation/NavigationController";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

function App() {
    const newVersionAvailable = useIsNewVersionAvailable();
    const authenticated = useIsAuthenticated();

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <NavigationController />
                {/*{authenticated && newVersionAvailable && <NewVersionAvailable />}*/}
                {/*<Header*/}
                {/*    authenticated={authenticated}*/}
                {/*/>*/}
                {/*<RoutingSwitch*/}
                {/*    routes={routes}*/}
                {/*    authenticated={authenticated}*/}
                {/*/>*/}
                {/*<SnackPack />*/}
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default App;
