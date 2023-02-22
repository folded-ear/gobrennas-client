import * as React from "react";
import "./App.scss";
import useIsNewVersionAvailable from "./data/useIsNewVersionAvailable";
import { useIsAuthenticated } from "./providers/Profile";
import { ThemeProvider } from "@material-ui/core/styles";
import theme from "./theme";
import CssBaseline from "@material-ui/core/CssBaseline";
import NewVersionAvailable from "./views/NewVersionAvailable";
import Header from "./Header";
import RoutingSwitch from "./RoutingSwitch";
import routes from "./routes";
import SnackPack from "./views/common/SnackPack";

function App() {
    const newVersionAvailable = useIsNewVersionAvailable();
    const authenticated = useIsAuthenticated();

    return <ThemeProvider theme={theme}>
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
    </ThemeProvider>;
}

export default App;
