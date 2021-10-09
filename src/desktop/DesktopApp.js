import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider } from "@material-ui/core/styles";
import React from "react";
import useIsNewVersionAvailable from "../data/useIsNewVersionAvailable";
import { useIsAuthenticated } from "../providers/Profile";
import routes from "../routes";
import RoutingSwitch from "../RoutingSwitch";
import theme from "../theme";
import SnackPack from "../views/common/SnackPack";
import NewVersionAvailable from "../views/NewVersionAvailable";
import DesktopHeader from "./DesktopHeader";

function DesktopApp() {
    const newVersionAvailable = useIsNewVersionAvailable();
    const authenticated = useIsAuthenticated();

    return <ThemeProvider theme={theme}>
        <CssBaseline />
        {authenticated && newVersionAvailable && <NewVersionAvailable />}
        <DesktopHeader
            authenticated={authenticated}
        />
        <RoutingSwitch
            routes={routes}
            authenticated={authenticated}
        />
        <SnackPack />
    </ThemeProvider>;
}

export default DesktopApp;
