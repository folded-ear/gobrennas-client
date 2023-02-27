import * as React from "react";
import "./App.scss";
import useIsNewVersionAvailable from "./data/useIsNewVersionAvailable";
import { useIsAuthenticated } from "./providers/Profile";
import {
    StyledEngineProvider,
    Theme,
    ThemeProvider
} from "@mui/styles";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";
import NewVersionAvailable from "./views/NewVersionAvailable";
import Header from "./Header";
import RoutingSwitch from "./RoutingSwitch";
import routes from "./routes";
import SnackPack from "./views/common/SnackPack";


declare module '@mui/styles/defaultTheme' {
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
                {authenticated && newVersionAvailable && <NewVersionAvailable />}
                <Header
                    authenticated={authenticated}
                />
                <RoutingSwitch
                    routes={routes}
                    authenticated={authenticated}
                />
                <SnackPack />
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default App;
